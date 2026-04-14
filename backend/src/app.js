import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

const allowedOrigins = (
    process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'tauri://localhost'
    ]
);


app.use(cors({
  origin: true,
  credentials: true
}));

app.use((req, res, next) => {
  console.log('✅ Allowed Origin gesetzt für:', req.headers.origin);
  next();
});

/*app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blockiert Origin: ${origin}`));
  },
  credentials: true
}));*/

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'API erreichbar' });
});

app.use('/api', routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;