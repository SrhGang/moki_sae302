import express from 'express';
import { protect } from '../controllers/authController';

const router = express.Router();

router.post('/', protect);

export default router;