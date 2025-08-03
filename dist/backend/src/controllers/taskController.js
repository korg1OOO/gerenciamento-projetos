var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Task from '../models/Task';
import Operation from '../models/Operation';
export const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        let tasks;
        if (user.permissions.canAccessAllProjects) {
            tasks = yield Task.find().populate('createdBy', 'name email');
        }
        else {
            const accessibleOperations = yield Operation.find({
                $or: [
                    { _id: { $in: user.permissions.assignedOperations } },
                    { createdBy: user._id },
                ],
            }).select('_id');
            const accessibleOpIds = accessibleOperations.map((op) => op._id.toString());
            tasks = yield Task.find({
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
export const addTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskData = req.body;
    try {
        const task = new Task(Object.assign(Object.assign({}, taskData), { createdBy: req.user._id, createdAt: new Date() }));
        yield task.save();
        const responseData = Object.assign(Object.assign({}, task.toJSON()), { id: task._id.toString() });
        res.status(201).json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
export const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const task = yield Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const updatedTask = yield Task.findByIdAndUpdate(id, updates, { new: true });
        const responseData = Object.assign(Object.assign({}, updatedTask.toJSON()), { id: updatedTask._id.toString() });
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
export const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const task = yield Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        yield Task.findByIdAndDelete(id);
        res.json({ message: 'Task deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
