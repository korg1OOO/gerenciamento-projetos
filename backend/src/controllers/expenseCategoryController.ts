import { Request, Response } from 'express';
import ExpenseCategory from '../models/ExpenseCategory';
import { AuthRequest } from '../middleware/authMiddleware';

export const getExpenseCategories = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const categories = await ExpenseCategory.find({ createdBy: user._id }).populate('createdBy', 'name email');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const addExpenseCategory = async (req: AuthRequest, res: Response) => {
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
    const category = await ExpenseCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (category.createdBy.toString() !== req.user._id.toString()) {
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
    const category = await ExpenseCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (category.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    await ExpenseCategory.findByIdAndDelete(id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};