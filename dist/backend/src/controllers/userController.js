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
exports.updateUserPermissions = exports.deleteUser = exports.updateUser = exports.addUser = exports.getUsers = void 0;
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
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only return the current user
        res.json([mapUserToResponse(req.user)]);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUsers = getUsers;
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Disable adding users by non-admins, but since no roles, perhaps disable entirely or allow self-registration, but register is in auth
    return res.status(403).json({ message: 'Permission denied' });
});
exports.addUser = addUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        if (id !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const user = yield User_1.default.findByIdAndUpdate(id, updates, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(mapUserToResponse(user));
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (id !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const user = yield User_1.default.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteUser = deleteUser;
const updateUserPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Disable since no roles
    return res.status(403).json({ message: 'Permission denied' });
});
exports.updateUserPermissions = updateUserPermissions;
