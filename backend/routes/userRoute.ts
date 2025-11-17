import express from 'express';
import { protect, getUserInfo, searchUsers } from '../controllers/authController';

const router = express.Router();

router.post('/', protect, getUserInfo);
router.get('/search', protect, searchUsers);

export default router;