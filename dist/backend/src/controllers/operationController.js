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
exports.deleteOperation = exports.updateOperation = exports.addOperation = exports.getOperations = void 0;
const Operation_1 = __importDefault(require("../models/Operation"));
const getOperations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let operations;
        if (user.permissions.canAccessAllProjects) {
            operations = yield Operation_1.default.find().populate('createdBy', 'name email');
        }
        else {
            operations = yield Operation_1.default.find({
                $or: [
                    { _id: { $in: user.permissions.assignedOperations } },
                    { createdBy: user._id },
                ],
            }).populate('createdBy', 'name email');
        }
        const responseData = operations.map((op) => (Object.assign(Object.assign({}, op.toJSON()), { id: op._id.toString() })));
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getOperations = getOperations;
const addOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user.permissions.canEditOperations) {
        return res.status(403).json({ message: 'Permission denied' });
    }
    const operationData = req.body;
    try {
        const operation = new Operation_1.default(Object.assign(Object.assign({}, operationData), { createdBy: req.user._id, createdAt: new Date() }));
        yield operation.save();
        const responseData = Object.assign(Object.assign({}, operation.toJSON()), { id: operation._id.toString() });
        res.status(201).json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.addOperation = addOperation;
const updateOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user.permissions.canEditOperations) {
        return res.status(403).json({ message: 'Permission denied' });
    }
    const { id } = req.params;
    const updates = req.body;
    try {
        const operation = yield Operation_1.default.findById(id);
        if (!operation) {
            return res.status(404).json({ message: 'Operation not found' });
        }
        if (!req.user.permissions.canAccessAllProjects &&
            operation.createdBy.toString() !== req.user._id.toString() &&
            !req.user.permissions.assignedOperations.includes(id)) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const updatedOperation = yield Operation_1.default.findByIdAndUpdate(id, updates, { new: true });
        const responseData = Object.assign(Object.assign({}, updatedOperation.toJSON()), { id: updatedOperation._id.toString() });
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.updateOperation = updateOperation;
const deleteOperation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user.permissions.canEditOperations) {
        return res.status(403).json({ message: 'Permission denied' });
    }
    const { id } = req.params;
    try {
        const operation = yield Operation_1.default.findById(id);
        if (!operation) {
            return res.status(404).json({ message: 'Operation not found' });
        }
        if (!req.user.permissions.canAccessAllProjects && operation.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        yield Operation_1.default.findByIdAndDelete(id);
        res.json({ message: 'Operation deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.deleteOperation = deleteOperation;
