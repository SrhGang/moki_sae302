import { Request, Response } from 'express';
import { Message } from '../models/messageModel';
import { io, connectedUsers } from '../server';

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { recipient, content } = req.body;
        const sender = (req as any).user.username;

        const message = new Message({ sender, recipient, content });
        await message.save();

        const recipientSocketId = connectedUsers.get(recipient);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive_message', {
                sender,
                content,
                timestamp: message.timestamp
            });
        }

        res.status(200).json({ message: 'Message sent', code: 'MESSAGE_SENT' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { otherUser } = req.params;
        const currentUser = (req as any).user.username;

        const messages = await Message.find({
            $or: [
                { sender: currentUser, recipient: otherUser },
                { sender: otherUser, recipient: currentUser }
            ]
        }).sort({ timestamp: 1 });

        res.status(200).json({ messages, code: 'MESSAGES_RETRIEVED' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
    }
};