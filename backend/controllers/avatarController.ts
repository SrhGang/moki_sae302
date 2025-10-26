import { Request, Response } from 'express';
import { User } from '../models/userModel';

export const updateAvatar = async (req: Request, res: Response) => {
    try {
        const { profilePicture } = req.body;
        const uid = (req as any).user.uid;

        if (!profilePicture) {
            return res.status(400).json({ error: 'Profile picture is required' });
        }

        const user = await User.findOneAndUpdate(
            { uid }, 
            { profilePicture }, 
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ 
            message: 'Profile picture updated successfully',
            profilePicture: user.profilePicture 
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAvatar = async (req: Request, res: Response) => {
    try {
        const uid = (req as any).user.uid;
        const user = await User.findOne({ uid });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ profilePicture: user.profilePicture });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};