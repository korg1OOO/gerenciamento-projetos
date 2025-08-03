"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../../backend/src/models/User"));
module.exports = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' });
        }
        const { email, password } = req.body;
        try {
            console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI);
            yield mongoose_1.default.connect(process.env.MONGODB_URI);
            console.log('MongoDB connected, searching for user:', email);
            const user = yield User_1.default.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            console.log('Comparing passwords');
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            user.lastLogin = new Date();
            yield user.save();
            console.log('User saved, generating token');
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token, user: Object.assign(Object.assign({}, user.toJSON()), { password: undefined }) });
        }
        catch (error) {
            console.error('Login error details:', error.message, error.stack);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
};
