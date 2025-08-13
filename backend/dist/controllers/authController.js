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
exports.getCurrentUser = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const mapUserToResponse = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
});
exports.register = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('role').isIn(['admin', 'gestor', 'colaborador']).withMessage('Invalid role'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Register request received:', req.body);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password, role } = req.body;
        try {
            let user = yield User_1.default.findOne({ email });
            if (user) {
                console.log('User already exists:', email);
                return res.status(400).json({ message: 'User already exists' });
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            user = new User_1.default({
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
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d',
            });
            res.status(201).json({ token, user: mapUserToResponse(user) });
        }
        catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }),
];
exports.login = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Login request received:', req.body);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, rememberMe } = req.body;
        try {
            const user = yield User_1.default.findOne({ email });
            if (!user) {
                console.log('Invalid credentials for email:', email);
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                console.log('Invalid password for email:', email);
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            user.lastLogin = new Date();
            yield user.save();
            const expiresIn = rememberMe ? '30d' : '1h';
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn,
            });
            res.json({ token, user: mapUserToResponse(user) });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }),
];
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'No user authenticated' });
        }
        res.json(mapUserToResponse(req.user));
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getCurrentUser = getCurrentUser;
