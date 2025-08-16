// taskController.ts
import { Request, Response } from 'express';
import Task from '../models/Task';
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
    const tasks = await Task.find({ createdBy: user._id }).populate('createdBy', 'name email');
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
    // Normalize the date to midnight UTC
    const taskDate = new Date(taskData.date);
    taskDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC

    const task = new Task({
      ...taskData,
      date: taskDate, // Use normalized date
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
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    // Normalize the date to midnight UTC
    if (updates.date) {
      const taskDate = new Date(updates.date);
      taskDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
      updates.date = taskDate;
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
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};