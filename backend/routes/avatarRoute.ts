import express from 'express';
import { updateAvatar, getAvatar } from '../controllers/avatarController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.put('/', authenticateToken, updateAvatar);
router.get('/', authenticateToken, getAvatar);

export default router;