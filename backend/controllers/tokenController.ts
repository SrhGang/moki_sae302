import { Request, Response } from "express";

const secretKey = process.env.SECRET || "dev";
const refreshSecret = process.env.REFRESH_SECRET || "dev";

import jwt from "jsonwebtoken";
import { User } from "../models/userModel";

export const refreshToken = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        res.status(401).json({ message: 'Refresh token is required', code: "TOKEN_MISSING" });
        return;
    }
    try {
        const decoded = jwt.verify(token, refreshSecret) as { uid: string };
        const user = await User.findById(decoded.uid);
        if (!user) {
            res.status(401).json({ message: 'User not found', code: "USER_NOT_FOUND" });
            return;
        }
        if (user.refreshToken !== token) {
            res.status(401).json({ message: 'Invalid refresh token', code: "INVALID_TOKEN" });
            return;
        }
        const accessToken = jwt.sign({ id: user._id }, secretKey, { expiresIn: '30m' });
        res.status(200).json({ accessToken });
        return;
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token', code: "INVALID_TOKEN" });
        return;
    }
};

export const verifyToken = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        res.status(401).json({ message: 'Token is required', code: "TOKEN_MISSING" });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET || "dev") as { id: string };
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(401).json({ message: 'User not found', code: "USER_NOT_FOUND" });
            return;
        }
        res.status(200).json({ message: 'Token is valid', code: "TOKEN_VALID" });
        return;
    } catch (error) {
        res.status(401).json({ message: 'Invalid token', code: "INVALID_TOKEN" });
        return;
    }
};

export const deleteRefreshToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(401).json({ message: 'Refresh token is required', code: "TOKEN_MISSING" });
            return;
        }
        const user = await User.findOne({ refreshToken: token });
        if (!user) {
            res.status(401).json({ message: 'User not found', code: "USER_NOT_FOUND" });
            return;
        }
        user.refreshToken = "";
        user.save();

        res.status(200).json({ message: 'Refresh token deleted successfully', code: "TOKEN_DELETED" });
        return;
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', code: "INTERNAL_SERVER_ERROR" });
        return;
    }
}
