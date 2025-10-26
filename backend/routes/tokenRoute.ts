import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { refreshToken } from '../controllers/tokenController';

const router = express.Router();

router.post('/', authenticateToken, refreshToken);

export default router;