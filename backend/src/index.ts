import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { database } from './database/db';
import { errorHandler } from './middleware/errorHandler';
import { container } from 'tsyringe';
import { UserModel, IUserModel } from './models/User';
import { IUserApplication, userApplication } from './application/userApplication';

dotenv.config();

container.register<IUserModel>("IUserModel", { useClass: UserModel });
container.register<IUserApplication>("IUserApplication", { useClass: userApplication });

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import githubRoutes from './routes/githubRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/github', githubRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await database.connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await database.close();
  process.exit(0);
});
