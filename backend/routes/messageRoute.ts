import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import { protect } from '../controllers/authController';

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/:otherUser', protect, getMessages);

export default router;