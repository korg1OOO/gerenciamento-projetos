import { Request, Response } from 'express';
import Operation from '../models/Operation';
import { Operation as OperationType } from '../types'; // Import the Operation interface
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

// Define a base interface for Mongoose document fields
interface BaseOperationDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  id: string; // Derived from _id.toString() for frontend
}

// Extend with OperationType minus 'id'
type OperationDocument = BaseOperationDocument & Omit<OperationType, 'id'>;

export const getOperations = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    let operations;
    if (user.permissions.canAccessAllProjects) {
      operations = await Operation.find().populate('createdBy', 'name email');
    } else {
      operations = await Operation.find({
        $or: [
          { _id: { $in: user.permissions.assignedOperations } },
          { createdBy: user._id },
        ],
      }).populate('createdBy', 'name email');
    }
    const responseData = operations.map((op) => ({
      ...op.toJSON(),
      id: op._id.toString(),
    }));
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const addOperation = async (req: AuthRequest, res: Response) => {
  if (!req.user.permissions.canEditOperations) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const operationData = req.body;
  try {
    const operation = new Operation({
      ...operationData,
      createdBy: req.user._id,
      createdAt: new Date(),
    });
    await operation.save();
    const responseData = { ...operation.toJSON(), id: operation._id.toString() };
    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateOperation = async (req: AuthRequest, res: Response) => {
  if (!req.user.permissions.canEditOperations) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const { id } = req.params;
  const updates = req.body;
  try {
    const operation = await Operation.findById(id) as OperationDocument | null;
    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }
    if (
      !req.user.permissions.canAccessAllProjects &&
      operation.createdBy.toString() !== req.user._id.toString() &&
      !req.user.permissions.assignedOperations.includes(id)
    ) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    const updatedOperation = await Operation.findByIdAndUpdate(id, updates, { new: true });
    const responseData = { ...updatedOperation!.toJSON(), id: updatedOperation!._id.toString() };
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteOperation = async (req: AuthRequest, res: Response) => {
  if (!req.user.permissions.canEditOperations) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const { id } = req.params;
  try {
    const operation = await Operation.findById(id) as OperationDocument | null;
    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }
    if (!req.user.permissions.canAccessAllProjects && operation.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    await Operation.findByIdAndDelete(id);
    res.json({ message: 'Operation deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};