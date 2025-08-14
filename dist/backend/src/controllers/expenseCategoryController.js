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
exports.deleteExpenseCategory = exports.updateExpenseCategory = exports.addExpenseCategory = exports.getExpenseCategories = void 0;
const ExpenseCategory_1 = __importDefault(require("../models/ExpenseCategory"));
const getExpenseCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const categories = yield ExpenseCategory_1.default.find({ createdBy: user._id }).populate('createdBy', 'name email');
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.getExpenseCategories = getExpenseCategories;
const addExpenseCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryData = req.body;
    try {
        const category = new ExpenseCategory_1.default(Object.assign(Object.assign({}, categoryData), { createdBy: req.user._id }));
        yield category.save();
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.addExpenseCategory = addExpenseCategory;
const updateExpenseCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updates = req.body;
    try {
        const category = yield ExpenseCategory_1.default.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (category.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        const updatedCategory = yield ExpenseCategory_1.default.findByIdAndUpdate(id, updates, { new: true });
        res.json(updatedCategory);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.updateExpenseCategory = updateExpenseCategory;
const deleteExpenseCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const category = yield ExpenseCategory_1.default.findById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (category.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Permission denied' });
        }
        yield ExpenseCategory_1.default.findByIdAndDelete(id);
        res.json({ message: 'Category deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
exports.deleteExpenseCategory = deleteExpenseCategory;
