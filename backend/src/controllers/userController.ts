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
    // Only return the current user
    res.json([mapUserToResponse(req.user)]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addUser = async (req: AuthRequest, res: Response) => {
  // Disable adding users by non-admins, but since no roles, perhaps disable entirely or allow self-registration, but register is in auth
  return res.status(403).json({ message: 'Permission denied' });
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    if (id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
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
    if (id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
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
  // Disable since no roles
  return res.status(403).json({ message: 'Permission denied' });
};