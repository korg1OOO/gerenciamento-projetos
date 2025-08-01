import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Operation from '../models/Operation';
import { Expense as ExpenseType } from '../types';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

interface BaseExpenseDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  id: string;
}

type ExpenseDocument = BaseExpenseDocument & Omit<ExpenseType, 'id'>;

export const getExpenses = async (req: AuthRequest, res: Response) => {
  if (!req.user.permissions.canViewFinance) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  try {
    const user = req.user;
    let expenses;
    if (user.permissions.canAccessAllProjects) {
      expenses = await Expense.find().populate('createdBy', 'name email');
    } else {
      const accessibleOperations = await Operation.find({
        $or: [
          { _id: { $in: user.permissions.assignedOperations } },
          { createdBy: user._id },
        ],
      }).select('_id');
      const accessibleOpIds = accessibleOperations.map((op) => op._id.toString());
      expenses = await Expense.find({
        $or: [
          { operationId: { $in: accessibleOpIds } },
          { createdBy: user._id },
        ],
      }).populate('createdBy', 'name email');
    }
    const responseData = expenses.map((exp) => ({
      ...exp.toJSON(),
      id: exp._id.toString(),
    }));
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const addExpense = async (req: AuthRequest, res: Response) => {
  const expenseData = req.body;
  try {
    const expense = new Expense({
      ...expenseData,
      createdBy: req.user._id,
      createdAt: new Date(),
    });
    await expense.save();
    const responseData = { ...expense.toJSON(), id: expense._id.toString() };
    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const expense = await Expense.findById(id) as ExpenseDocument | null;
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    if (req.user.role !== 'admin' && expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    const updatedExpense = await Expense.findByIdAndUpdate(id, updates, { new: true });
    const responseData = { ...updatedExpense!.toJSON(), id: updatedExpense!._id.toString() };
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const expense = await Expense.findById(id) as ExpenseDocument | null;
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    if (req.user.role !== 'admin' && expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    await Expense.findByIdAndDelete(id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};