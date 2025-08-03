import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getTasks, addTask, updateTask, deleteTask } from '../controllers/taskController';
const router = Router();
router.get('/', authMiddleware, getTasks);
router.post('/', authMiddleware, addTask);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);
export default router;
