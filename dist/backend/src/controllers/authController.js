var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { body, validationResult } from 'express-validator';
export const register = [
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Register request received:', req.body); // Log incoming request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array()); // Log validation errors
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password, role } = req.body;
        try {
            let user = yield User.findOne({ email });
            if (user) {
                console.log('User already exists:', email);
                return res.status(400).json({ message: 'User already exists' });
            }
            const hashedPassword = yield bcrypt.hash(password, 10);
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
            yield user.save();
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            res.status(201).json({ token, user: Object.assign(Object.assign({}, user.toJSON()), { password: undefined }) });
        }
        catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }),
];
export const login = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Login request received:', req.body); // Log incoming request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array()); // Log validation errors
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            const user = yield User.findOne({ email });
            if (!user) {
                console.log('Invalid credentials for email:', email);
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            const isMatch = yield bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log('Invalid password for email:', email);
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            user.lastLogin = new Date();
            yield user.save();
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            res.json({ token, user: Object.assign(Object.assign({}, user.toJSON()), { password: undefined }) });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }),
];
export const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'No user authenticated' });
        }
        res.json(req.user);
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
