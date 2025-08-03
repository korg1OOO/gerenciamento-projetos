import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import operationRoutes from './routes/operationRoutes';
import expenseRoutes from './routes/expenseRoutes';
import taskRoutes from './routes/taskRoutes';
import clientRoutes from './routes/clientRoutes';

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:8080',
  'https://gerenciamento-projetos-six.vercel.app' // Production frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/clients', clientRoutes);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));