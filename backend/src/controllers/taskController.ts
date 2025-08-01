import { Request, Response } from 'express';
import Task from '../models/Task';
import Operation from '../models/Operation';
import { Task as TaskType } from '../types';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

interface BaseTaskDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  id: string;
}

type TaskDocument = BaseTaskDocument & Omit<TaskType, 'id'>;

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    let tasks;
    if (user.permissions.canAccessAllProjects) {
      tasks = await Task.find().populate('createdBy', 'name email');
    } else {
      const accessibleOperations = await Operation.find({
        $or: [
          { _id: { $in: user.permissions.assignedOperations } },
          { createdBy: user._id },
        ],
      }).select('_id');
      const accessibleOpIds = accessibleOperations.map((op) => op._id.toString());
      tasks = await Task.find({
        $or: [
          { operationId: { $in: accessibleOpIds } },
          { createdBy: user._id },
        ],
      }).populate('createdBy', 'name email');
    }
    const responseData = tasks.map((task) => ({
      ...task.toJSON(),
      id: task._id.toString(),
    }));
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const addTask = async (req: AuthRequest, res: Response) => {
  const taskData = req.body;
  try {
    const task = new Task({
      ...taskData,
      createdBy: req.user._id,
      createdAt: new Date(),
    });
    await task.save();
    const responseData = { ...task.toJSON(), id: task._id.toString() };
    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const task = await Task.findById(id) as TaskDocument | null;
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
    const responseData = { ...updatedTask!.toJSON(), id: updatedTask!._id.toString() };
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id) as TaskDocument | null;
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};