import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createSupabaseClient } from './lib/supabase';
import { rateLimiter } from './lib/rate-limiter';
import { registerAuthRoutes } from './routes/auth';
import { registerAccountRoutes } from './routes/account';
import { registerNotificationsRoutes } from './routes/notifications';
import { registerRecoverRoutes } from './routes/recover';
import { registerProfileRoutes } from './routes/profile';
import { registerHealthRoutes } from './routes/health';
import { registerSiteRoutes } from './routes/site';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4001);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

app.use(
  cors({
    origin: frontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));

const footerTextPath = path.resolve(__dirname, '../../../site/src/data/site-info.json');
const logoPath = path.resolve(__dirname, '../../../site/public/assets/brand/isologo.webp');
const assetsPath = path.resolve(__dirname, '../../../site/public/assets');

app.use('/api', rateLimiter);
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
    return res.status(415).json({ error: 'Unsupported content type' });
  }
  next();
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

if (!supabase) {
  console.warn('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not both set. Supabase routes will be disabled.');
}

registerHealthRoutes(app);
registerSiteRoutes(app, assetsPath, footerTextPath, logoPath);
registerAuthRoutes(app, supabase);
registerRecoverRoutes(app, supabase);
registerNotificationsRoutes(app, supabase);
registerAccountRoutes(app, supabase);
registerProfileRoutes(app, supabase);

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
