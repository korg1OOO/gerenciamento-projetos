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
exports.deleteExpense = exports.updateExpense = exports.addExpense = exports.getExpenses = void 0;
const Expense_1 = __importDefault(require("../models/Expense"));
const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user.permissions.canViewFinance) {
        return res.status(403).json({ message: 'Permission denied' });
    }
    try {
        const user = req.user;
        let expenses;
        if (user.role === 'admin') {
            expenses = yield Expense_1.default.find().populate('createdBy', 'name email');
        }
        else {
            expenses = yield Expense_1.default.find({ createdBy: user._id }).populate('createdBy', 'name email');
        }
        const responseData = expenses.map((exp) => (Object.assign(Object.assign({}, exp.toJSON()), { id: exp._id.toString() })));
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getExpenses = getExpenses;
const addExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expenseData = req.body;
    try {
        const expense = new Expense_1.default(Object.assign(Object.assign({}, expenseData), { createdBy: req.user._id, createdAt: new Date() }));
        yield expense.save();
        const responseData = Object.assign(Object.assign({}, expense.toJSON()), { id: expense._id.toString() });
        res.status(201).json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.addExpense = addExpense;
const updateExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const expense = yield Expense_1.default.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        if (req.user.role !== 'admin' && expense.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const updatedExpense = yield Expense_1.default.findByIdAndUpdate(id, updates, { new: true });
        const responseData = Object.assign(Object.assign({}, updatedExpense.toJSON()), { id: updatedExpense._id.toString() });
        res.json(responseData);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.updateExpense = updateExpense;
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const expense = yield Expense_1.default.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        if (req.user.role !== 'admin' && expense.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        yield Expense_1.default.findByIdAndDelete(id);
        res.json({ message: 'Expense deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.deleteExpense = deleteExpense;
