import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,https://sport-portal-omega.vercel.app')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'sport-portal-api' });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;