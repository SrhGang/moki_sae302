import { Request, Response } from 'express';
import { Message } from '../models/messageModel';
import { io, connectedUsers } from '../server';

export const sendMessage = async (req: Request, res: Response) => {
    console.log('📨 Début de sendMessage');
    
    try {
        console.log('🔍 Headers reçus:', req.headers);
        console.log('👤 User dans la request:', (req as any).user);
        console.log('📝 Body reçu:', req.body);

        const { recipient, content } = req.body;
        const sender = (req as any).user?.username;

        console.log('👥 Infos message:');
        console.log('  - Expéditeur:', sender);
        console.log('  - Destinataire:', recipient);
        console.log('  - Contenu:', content);

        // Validation des données
        if (!sender) {
            console.log('❌ Erreur: Expéditeur non trouvé dans la request');
            return res.status(401).json({ error: 'Sender not authenticated', code: 'UNAUTHENTICATED' });
        }

        if (!recipient || !content) {
            console.log('❌ Erreur: Données manquantes');
            console.log('  - Recipient manquant?:', !recipient);
            console.log('  - Content manquant?:', !content);
            return res.status(400).json({ error: 'Recipient and content are required', code: 'MISSING_DATA' });
        }

        console.log('💾 Création du message en base...');
        const message = new Message({ sender, recipient, content });
        await message.save();
        console.log('✅ Message sauvegardé avec ID:', message._id);

        console.log('🔍 Recherche du destinataire dans les utilisateurs connectés...');
        const recipientSocketId = connectedUsers.get(recipient);
        console.log('🎯 Socket ID du destinataire:', recipientSocketId);
        console.log('👥 Utilisateurs connectés:', Array.from(connectedUsers.entries()));

        if (recipientSocketId) {
            console.log('🚀 Envoi du message via WebSocket...');
            const messageData = {
                sender,
                content,
                timestamp: message.timestamp,
                messageId: message._id
            };
            console.log('📤 Données envoyées via WS:', messageData);
            
            io.to(recipientSocketId).emit('receive_message', messageData);
            console.log('✅ Message envoyé via WebSocket');
        } else {
            console.log('⚠️ Destinataire non connecté, message stocké seulement en base');
        }

        console.log('✅ Message traité avec succès');
        res.status(200).json({ 
            message: 'Message sent', 
            code: 'MESSAGE_SENT',
            messageId: message._id,
            timestamp: message.timestamp
        });

    } catch (error: any) {
        console.log('❌ ERREUR dans sendMessage:');
        console.log('  - Type:', error.name);
        console.log('  - Message:', error.message);
        console.log('  - Stack:', error.stack);
        
        if (error.name === 'ValidationError') {
            console.log('📋 Erreur de validation MongoDB:', error.errors);
            return res.status(400).json({ 
                error: 'Invalid message data', 
                code: 'VALIDATION_ERROR',
                details: error.errors 
            });
        }

        if (error.name === 'MongoError') {
            console.log('🗄️ Erreur MongoDB:', error.code, error.message);
            return res.status(500).json({ 
                error: 'Database error', 
                code: 'DATABASE_ERROR' 
            });
        }

        console.log('🔥 Erreur interne du serveur');
        res.status(500).json({ 
            error: 'Internal server error', 
            code: 'INTERNAL_SERVER_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        console.log('🏁 Fin de sendMessage');
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