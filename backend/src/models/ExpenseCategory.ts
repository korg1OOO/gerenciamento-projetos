// models/ExpenseCategory.ts
import mongoose, { Schema, Document } from 'mongoose';

interface ExpenseCategoryDocument extends Document {
  name: string;
  type: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const expenseCategorySchema: Schema = new Schema<ExpenseCategoryDocument>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ExpenseCategoryDocument>('ExpenseCategory', expenseCategorySchema);