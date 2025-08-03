import mongoose, { Schema } from 'mongoose';
import { Operation } from '../types';

const operationSchema = new Schema<Operation>({
  name: { type: String, required: true },
  type: { type: String, enum: ['saas', 'produto', 'loja', 'servico', 'outro'], required: true },
  status: { type: String, enum: ['planejamento', 'execucao', 'finalizado', 'arquivado'], required: true },
  links: {
    drive: { type: String, default: '' },
    notion: { type: String, default: '' },
    domain: { type: String, default: '' },
    other: { type: String, default: '' },
  },
  notes: { type: String, default: '' },
  profile: { type: String, enum: ['pf', 'pj'], required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<Operation>('Operation', operationSchema);