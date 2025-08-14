import { Request, Response } from 'express';
import OperationType from '../models/OperationType';
import { AuthRequest } from '../middleware/authMiddleware';

export const getOperationTypes = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const types = await OperationType.find({ createdBy: user._id }).populate('createdBy', 'name email');
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const addOperationType = async (req: AuthRequest, res: Response) => {
  const typeData = req.body;
  try {
    const opType = new OperationType({
      ...typeData,
      createdBy: req.user._id,
    });
    await opType.save();
    res.status(201).json(opType);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateOperationType = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const opType = await OperationType.findById(id);
    if (!opType) {
      return res.status(404).json({ message: 'Type not found' });
    }
    if (opType.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    const updatedType = await OperationType.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedType);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteOperationType = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const opType = await OperationType.findById(id);
    if (!opType) {
      return res.status(404).json({ message: 'Type not found' });
    }
    if (opType.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    await OperationType.findByIdAndDelete(id);
    res.json({ message: 'Type deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};