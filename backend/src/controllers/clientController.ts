import { Request, Response } from 'express';
import Client from '../models/Client';
import Operation from '../models/Operation';
import { Client as ClientType } from '../types';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

interface BaseClientDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  id: string;
}

type ClientDocument = BaseClientDocument & Omit<ClientType, 'id'>;

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    let clients;
    if (user.permissions.canAccessAllProjects) {
      clients = await Client.find().populate('createdBy', 'name email');
    } else {
      const accessibleOperations = await Operation.find({
        $or: [
          { _id: { $in: user.permissions.assignedOperations } },
          { createdBy: user._id },
        ],
      }).select('_id');
      const accessibleOpIds = accessibleOperations.map((op) => op._id.toString());
      clients = await Client.find({
        $or: [
          { operationId: { $in: accessibleOpIds } },
          { createdBy: user._id },
        ],
      }).populate('createdBy', 'name email');
    }
    const responseData = clients.map((client) => ({
      ...client.toJSON(),
      id: client._id.toString(),
    }));
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const addClient = async (req: AuthRequest, res: Response) => {
  const clientData = req.body;
  try {
    const client = new Client({
      ...clientData,
      createdBy: req.user._id,
      createdAt: new Date(),
    });
    await client.save();
    const responseData = { ...client.toJSON(), id: client._id.toString() };
    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const client = await Client.findById(id) as ClientDocument | null;
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    const updatedClient = await Client.findByIdAndUpdate(id, updates, { new: true });
    const responseData = { ...updatedClient!.toJSON(), id: updatedClient!._id.toString() };
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const client = await Client.findById(id) as ClientDocument | null;
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    if (req.user.role !== 'admin' && client.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    await Client.findByIdAndDelete(id);
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};