import mongoose, { Schema } from 'mongoose';
import { Client } from '../types';

const clientSchema = new Schema<Client>({
  name: { type: String, required: true },
  operationId: { type: String },
  observations: { type: String, default: '' },
  contact: { type: String, default: '' },
  profile: { type: String, enum: ['pf', 'pj'], required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<Client>('Client', clientSchema);