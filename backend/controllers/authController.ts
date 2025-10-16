import { Request, Response } from 'express';

const secretKey = process.env.SECRET_KEY!;
const refreshSecret = process.env.REFRESH_SECRET || "dev";

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';
import { deleteRefreshToken } from './tokenController';

export const signup = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required', code: "MISSING_FIELDS" });
            return;
        }

        if (username.length < 3 || username.length > 20) {
            res.status(400).json({ error: 'Username must be between 3 and 20 characters', code: "INVALID_USERNAME" });
            return;
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ error: 'Username already exists', code: "USERNAME_TAKEN" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword
        });

        const refreshToken = jwt.sign(
            { uid: newUser.uid, username: newUser.username },
            refreshSecret,
            { expiresIn: '7d' }
        );
        newUser.refreshToken = refreshToken;

        await newUser.save();
        res.status(201).json({ 
            message: 'User created successfully', 
            code: "USER_CREATED"
        });
        return;
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', code: "INTERNAL_SERVER_ERROR" });
        return;
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required', code: "MISSING_FIELDS" });
            return;
        }

        const user = await User.findOne({ username });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials', code: "INVALID_CREDENTIALS" });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials', code: "INVALID_CREDENTIALS" });
            return;
        }

        const accessToken = jwt.sign(
            { uid: user.uid, username: user.username },
            secretKey,
            { expiresIn: '30m' }
        );
        const refreshToken = jwt.sign(
            { uid: user.uid, username: user.username },
            refreshSecret,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        const token = {
            accessToken,
            refreshToken
        };

        res.json({
            message: 'Login successful',
            token,
            code: "LOGIN_SUCCESS"
        });
        return;
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
};

export const logout = (req: Request, res: Response) => {
    
    try {
        deleteRefreshToken(req, res);
        res.status(200).json({ message: 'Logout successful', code: "LOGOUT_SUCCESS" });
        return;
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', code: "INTERNAL_SERVER_ERROR" });
        return;
    }
};

export const protect = async (req: Request, res: Response, next: Function) => {
    console.log("J'ai recu une requete pour protect");
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Access token required', code: "MISSING_TOKEN" });
            return;
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, secretKey) as { uid: string; username: string };
        
        const user = await User.findOne({ uid: decoded.uid });
        if (!user) {
            res.status(401).json({ error: 'Invalid token', code: "INVALID_TOKEN" });
            return;
        }

        res.status(200).json({  username: user.username, profileImage: user.profilePicture, code: "USER_AUTHENTICATED" }); 
        return;
    } catch (e) {
        res.status(401).json({ error: 'Invalid token', code: "INVALID_TOKEN" });
        return;
    }
}