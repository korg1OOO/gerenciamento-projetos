var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../backend/src/models/User'; // Adjust path based on your structure
export default function handler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (req.method !== 'GET') {
            return res.status(405).json({ message: 'Method not allowed' });
        }
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        try {
            yield mongoose.connect(process.env.MONGODB_URI); // Ensure MONGODB_URI is set
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = yield User.findById(decoded.userId).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            return res.json(user);
        }
        catch (error) {
            console.error('Get current user error:', error);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
}
