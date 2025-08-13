// routes/expenseCategoryRoutes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getExpenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '../controllers/expenseCategoryController';

const router = Router();

router.get('/', authMiddleware, getExpenseCategories);
router.post('/', authMiddleware, addExpenseCategory);
router.put('/:id', authMiddleware, updateExpenseCategory);
router.delete('/:id', authMiddleware, deleteExpenseCategory);

export default router;