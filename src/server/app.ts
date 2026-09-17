import express from 'express';
import { authRouter } from './routes/auth';
import { domainRouter } from './routes/domain';

export const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', domainRouter);

export default app;
