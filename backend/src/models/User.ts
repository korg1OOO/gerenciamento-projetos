import mongoose, { Schema } from 'mongoose';
import { User } from '../types';

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'gestor', 'colaborador'], required: true },
  permissions: {
    canViewFinance: { type: Boolean, default: false },
    canEditOperations: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canAccessAllProjects: { type: Boolean, default: false },
    assignedOperations: [{ type: String }],
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

export default mongoose.model<User>('User', userSchema);