import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getUsers, addUser, updateUser, deleteUser, updateUserPermissions } from '../controllers/userController';

const router = Router();

router.get('/', authMiddleware, getUsers);
router.post('/', authMiddleware, addUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);
router.put('/:id/permissions', authMiddleware, updateUserPermissions);

export default router;