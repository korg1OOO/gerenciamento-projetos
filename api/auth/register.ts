import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../backend/src/models/User';

interface VercelRequest {
  method: string;
  body: { name: string; email: string; password: string; role: string };
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

module.exports = async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { name, email, password, role } = req.body;
  try {
    console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected, checking for existing user:', email);
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      permissions: {
        canViewFinance: role === 'admin' || role === 'gestor',
        canEditOperations: role === 'admin' || role === 'gestor',
        canManageUsers: role === 'admin',
        canAccessAllProjects: role === 'admin',
        assignedOperations: [],
      },
      createdAt: new Date(),
    });
    await user.save();
    console.log('User registered, generating token');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    return res.status(201).json({ token, user: { ...user.toJSON(), password: undefined } });
  } catch (error) {
    console.error('Register error details:', (error as Error).message, (error as Error).stack);
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};