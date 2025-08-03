import { NowRequest, NowResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../../backend/src/models/User'; // Adjust path based on your structure

export default async function handler(req: NowRequest, res: NowResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI as string); // Ensure MONGODB_URI is set
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
}