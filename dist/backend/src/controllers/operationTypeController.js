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
exports.deleteOperationType = exports.updateOperationType = exports.addOperationType = exports.getOperationTypes = void 0;
const OperationType_1 = __importDefault(require("../models/OperationType"));
const getOperationTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let types;
        if (user.role === 'admin') {
            types = yield OperationType_1.default.find().populate('createdBy', 'name email');
        }
        else {
            types = yield OperationType_1.default.find({ createdBy: user._id }).populate('createdBy', 'name email');
        }
        res.json(types);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getOperationTypes = getOperationTypes;
const addOperationType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Optional: restrict to admins
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' });
    }
    const typeData = req.body;
    try {
        const opType = new OperationType_1.default(Object.assign(Object.assign({}, typeData), { createdBy: req.user._id }));
        yield opType.save();
        res.status(201).json(opType);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.addOperationType = addOperationType;
const updateOperationType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const opType = yield OperationType_1.default.findById(id);
        if (!opType) {
            return res.status(404).json({ message: 'Type not found' });
        }
        if (req.user.role !== 'admin' && opType.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const updatedType = yield OperationType_1.default.findByIdAndUpdate(id, updates, { new: true });
        res.json(updatedType);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.updateOperationType = updateOperationType;
const deleteOperationType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const opType = yield OperationType_1.default.findById(id);
        if (!opType) {
            return res.status(404).json({ message: 'Type not found' });
        }
        if (req.user.role !== 'admin' && opType.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        yield OperationType_1.default.findByIdAndDelete(id);
        res.json({ message: 'Type deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.deleteOperationType = deleteOperationType;
