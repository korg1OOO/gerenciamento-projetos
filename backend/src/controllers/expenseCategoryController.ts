// controllers/expenseCategoryController.ts
import { Request, Response } from 'express';
import ExpenseCategory from '../models/ExpenseCategory';
import { AuthRequest } from '../middleware/authMiddleware';

export const getExpenseCategories = async (req: AuthRequest, res: Response) => {
  try {
    // Universal: return all categories (no permission filter, as they're configs)
    const categories = await ExpenseCategory.find().populate('createdBy', 'name email');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const addExpenseCategory = async (req: AuthRequest, res: Response) => {
  // Optional: restrict to admins
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Permission denied' });
  }
  const categoryData = req.body;
  try {
    const category = new ExpenseCategory({
      ...categoryData,
      createdBy: req.user._id,
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateExpenseCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Optional: restrict to admins or creator
    const category = await ExpenseCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (req.user.role !== 'admin' && category.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    const updatedCategory = await ExpenseCategory.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteExpenseCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    // Optional: restrict to admins or creator
    const category = await ExpenseCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (req.user.role !== 'admin' && category.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    await ExpenseCategory.findByIdAndDelete(id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};