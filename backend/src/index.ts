import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { database } from './database/db';
import { errorHandler } from './middleware/errorHandler';
import { container } from 'tsyringe';
import { UserModel, IUserModel } from './models/User';
import { IUserApplication, userApplication } from './application/userApplication';
import { HttpClient, IHttpClient } from './infrastructure/httpClient';
import { GithubApplication, IGithubApplication } from './application/githubApplication';

dotenv.config();

container.register<IUserModel>("IUserModel", { useClass: UserModel });
container.register<IUserApplication>("IUserApplication", { useClass: userApplication });
container.register<IHttpClient>("IHttpClient", { useClass: HttpClient });
container.register<IGithubApplication>("IGithubApplication", { useClass: GithubApplication });

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import githubRoutes from './routes/githubRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
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

    app.listen(PORT, () => {
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  await database.close();
  process.exit(0);
});
