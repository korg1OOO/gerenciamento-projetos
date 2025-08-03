import mongoose, { Schema } from 'mongoose';
const expenseSchema = new Schema({
    value: { type: Number, required: true },
    date: { type: Date, required: true },
    time: { type: String },
    category: { type: String, enum: ['infra', 'equipe', 'ferramentas', 'marketing', 'juridico', 'outro'], required: true },
    operationId: { type: String },
    description: { type: String, required: true },
    profile: { type: String, enum: ['pf', 'pj'], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});
export default mongoose.model('Expense', expenseSchema);
