import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import signupRoute from './routes/signupRoute';
import loginRoute from './routes/loginRoute';
import avatarRoute from './routes/avatarRoute';
import tokenRoute from './routes/tokenRoute';
import logoutRoute from './routes/logoutRoute';
import userRoute from './routes/userRoute';

import connectDB from './config/db';
import { corsOptions, corsMiddleware } from './config/cors';

const app = express();

connectDB();

app.use(cors(corsOptions));
app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api/avatar', avatarRoute);
app.use('/api/refresh', tokenRoute);
app.use('/api/logout', logoutRoute);
app.use('/api/protect', userRoute);


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
