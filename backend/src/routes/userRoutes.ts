import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { getUsers, addUser, updateUser, deleteUser, updateUserPermissions } from '../controllers/userController';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, getUsers);
router.post('/', authMiddleware, adminMiddleware, addUser);
router.put('/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);
router.put('/:id/permissions', authMiddleware, adminMiddleware, updateUserPermissions);

export default router;