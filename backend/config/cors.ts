import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'], // ON PEUT METTRE true POUR AUTORISER TOUTES LES ORIGINES POUR LE DEV
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

export const corsMiddleware = (req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
};