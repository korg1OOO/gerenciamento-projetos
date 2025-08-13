// models/OperationType.ts
import mongoose, { Schema, Document } from 'mongoose';

interface OperationTypeDocument extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const operationTypeSchema: Schema = new Schema<OperationTypeDocument>({
  name: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<OperationTypeDocument>('OperationType', operationTypeSchema);