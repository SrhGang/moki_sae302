import express from 'express';
import { protect, getUserInfo } from '../controllers/authController';

const router = express.Router();

router.post('/', protect, getUserInfo);

export default router;