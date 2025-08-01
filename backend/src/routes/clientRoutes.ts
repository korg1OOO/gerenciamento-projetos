import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getClients, addClient, updateClient, deleteClient } from '../controllers/clientController';

const router = Router();

router.get('/', authMiddleware, getClients);
router.post('/', authMiddleware, addClient);
router.put('/:id', authMiddleware, updateClient);
router.delete('/:id', authMiddleware, deleteClient);

export default router;