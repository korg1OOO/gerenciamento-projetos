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
import mongoose from 'mongoose';
import User from '../../backend/src/models/User';
export default function handler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' });
        }
        const { name, email, password, role } = req.body;
        try {
            console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI);
            yield mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB connected, checking for existing user:', email);
            let user = yield User.findOne({ email });
            if (user) {
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
            console.log('User registered, generating token');
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            return res.status(201).json({ token, user: Object.assign(Object.assign({}, user.toJSON()), { password: undefined }) });
        }
        catch (error) {
            console.error('Register error details:', error.message, error.stack);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
}
