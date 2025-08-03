import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../controllers/expenseController';

const router = Router();

router.get('/', authMiddleware, getExpenses);
router.post('/', authMiddleware, addExpense);
router.put('/:id', authMiddleware, updateExpense);
router.delete('/:id', authMiddleware, deleteExpense);

export default router;