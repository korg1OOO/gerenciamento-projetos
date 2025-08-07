import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
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

export const register = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['admin', 'gestor', 'colaborador']).withMessage('Invalid role'),
  async (req: Request, res: Response) => {
    console.log('Register request received:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        console.log('User already exists:', email);
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

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
      });

      res.status(201).json({ token, user: mapUserToResponse(user) });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
  },
];

export const login = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req: Request, res: Response) => {
    console.log('Login request received:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, rememberMe } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log('Invalid credentials for email:', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Invalid password for email:', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      user.lastLogin = new Date();
      await user.save();

      const expiresIn = rememberMe ? '30d' : '1h';
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
        expiresIn,
      });

      res.json({ token, user: mapUserToResponse(user) });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
  },
];

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No user authenticated' });
    }
    res.json(mapUserToResponse(req.user));
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};