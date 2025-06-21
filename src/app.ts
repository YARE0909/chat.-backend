import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import users from './routes/users';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', users)

export default app;
