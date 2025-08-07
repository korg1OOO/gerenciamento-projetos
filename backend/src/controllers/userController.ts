import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

const mapUserToResponse = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: user.permissions,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
});

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password');
    const mappedUsers = users.map(mapUserToResponse);
    res.json(mappedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addUser = async (req: AuthRequest, res: Response) => {
  const { name, email, role, permissions } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password: await bcrypt.hash('default123', 10), // Default password
      role,
      permissions,
      createdAt: new Date(),
    });

    await user.save();
    res.status(201).json(mapUserToResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(mapUserToResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserPermissions = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { permissions } = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, { permissions }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(mapUserToResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};