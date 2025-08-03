import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getOperations, addOperation, updateOperation, deleteOperation } from '../controllers/operationController';
const router = Router();
router.get('/', authMiddleware, getOperations);
router.post('/', authMiddleware, addOperation);
router.put('/:id', authMiddleware, updateOperation);
router.delete('/:id', authMiddleware, deleteOperation);
export default router;
