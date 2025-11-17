import mongoose from 'mongoose';
import { randomBytes } from 'crypto';

interface IUser {
    uid: string;
    username: string;
    password: string;
    profilePicture: string;
    refreshToken?: string;
    createdAt: Date;
    lastActive: Date;
}

const generateUID = (): string => {
    return 'u' + randomBytes(4).toString('hex');
}

const userSchema = new mongoose.Schema<IUser>({
    uid: { type: String, default: generateUID },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    refreshToken: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
});

userSchema.pre('save', function (next: any) {
    if (!this.uid) {
        this.uid = generateUID();
    }
    next();
});

userSchema.post('save', function (error: any, doc: any, next: any) {
    if (error.code === 11000) {
        next(new Error('Username already exists'));
    } else {
        next(error);
    }
});

export const User = mongoose.model('User', userSchema);