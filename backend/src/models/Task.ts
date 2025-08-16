// Task model (Task.ts)
import mongoose, { Schema } from 'mongoose';
import { Task } from '../types';

const taskSchema = new Schema<Task>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  time: { type: String },
  operationId: { type: String },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['baixa', 'media', 'alta'], required: true },
  profile: { type: String, enum: ['pf', 'pj'], required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<Task>('Task', taskSchema);