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
exports.deleteTask = exports.updateTask = exports.addTask = exports.getTasks = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const Operation_1 = __importDefault(require("../models/Operation"));
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let tasks;
        if (user.permissions.canAccessAllProjects) {
            tasks = yield Task_1.default.find().populate('createdBy', 'name email');
        }
        else {
            const accessibleOperations = yield Operation_1.default.find({
                $or: [
                    { _id: { $in: user.permissions.assignedOperations } },
                    { createdBy: user._id },
                ],
            }).select('_id');
            const accessibleOpIds = accessibleOperations.map((op) => op._id.toString());
            tasks = yield Task_1.default.find({
                $or: [
                    { operationId: { $in: accessibleOpIds } },
                    { createdBy: user._id },
                ],
            }).populate('createdBy', 'name email');
        }
        const responseData = tasks.map((task) => (Object.assign(Object.assign({}, task.toJSON()), { id: task._id.toString() })));
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getTasks = getTasks;
const addTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskData = req.body;
    try {
        const task = new Task_1.default(Object.assign(Object.assign({}, taskData), { createdBy: req.user._id, createdAt: new Date() }));
        yield task.save();
        const responseData = Object.assign(Object.assign({}, task.toJSON()), { id: task._id.toString() });
        res.status(201).json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.addTask = addTask;
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const task = yield Task_1.default.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const updatedTask = yield Task_1.default.findByIdAndUpdate(id, updates, { new: true });
        const responseData = Object.assign(Object.assign({}, updatedTask.toJSON()), { id: updatedTask._id.toString() });
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.updateTask = updateTask;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const task = yield Task_1.default.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        yield Task_1.default.findByIdAndDelete(id);
        res.json({ message: 'Task deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.deleteTask = deleteTask;
