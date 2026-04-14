import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'tauri://localhost'
  ]
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: true,
  credentials: true
}));

app.use((req, res, next) => {
  console.log('✅ Allowed Origin gesetzt für:', req.headers.origin);
  next();
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'API erreichbar' });
});

app.use('/api', routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;