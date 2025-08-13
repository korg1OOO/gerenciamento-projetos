// routes/operationTypeRoutes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getOperationTypes, addOperationType, updateOperationType, deleteOperationType } from '../controllers/operationTypeController';

const router = Router();

router.get('/', authMiddleware, getOperationTypes);
router.post('/', authMiddleware, addOperationType);
router.put('/:id', authMiddleware, updateOperationType);
router.delete('/:id', authMiddleware, deleteOperationType);

export default router;