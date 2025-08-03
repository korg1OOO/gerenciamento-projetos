var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Expense from '../models/Expense';
import Operation from '../models/Operation';
export const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user.permissions.canViewFinance) {
        return res.status(403).json({ message: 'Permission denied' });
    }
    try {
        const user = req.user;
        let expenses;
        if (user.permissions.canAccessAllProjects) {
            expenses = yield Expense.find().populate('createdBy', 'name email');
        }
        else {
            const accessibleOperations = yield Operation.find({
                $or: [
                    { _id: { $in: user.permissions.assignedOperations } },
                    { createdBy: user._id },
                ],
            }).select('_id');
            const accessibleOpIds = accessibleOperations.map((op) => op._id.toString());
            expenses = yield Expense.find({
                $or: [
                    { operationId: { $in: accessibleOpIds } },
                    { createdBy: user._id },
                ],
            }).populate('createdBy', 'name email');
        }
        const responseData = expenses.map((exp) => (Object.assign(Object.assign({}, exp.toJSON()), { id: exp._id.toString() })));
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
export const addExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expenseData = req.body;
    try {
        const expense = new Expense(Object.assign(Object.assign({}, expenseData), { createdBy: req.user._id, createdAt: new Date() }));
        yield expense.save();
        const responseData = Object.assign(Object.assign({}, expense.toJSON()), { id: expense._id.toString() });
        res.status(201).json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
export const updateExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const expense = yield Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        if (req.user.role !== 'admin' && expense.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const updatedExpense = yield Expense.findByIdAndUpdate(id, updates, { new: true });
        const responseData = Object.assign(Object.assign({}, updatedExpense.toJSON()), { id: updatedExpense._id.toString() });
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
export const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const expense = yield Expense.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        if (req.user.role !== 'admin' && expense.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        yield Expense.findByIdAndDelete(id);
        res.json({ message: 'Expense deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
