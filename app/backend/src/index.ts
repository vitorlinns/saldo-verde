import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

app.use(cors({
  origin: frontendOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

const footerTextPath = path.resolve(__dirname, '../../../site/src/data/site-info.json');
const logoPath = path.resolve(__dirname, '../../../site/public/assets/brand/isologo.png');

const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMax = 30; // 2 requests per minute over a 15-minute window
const rateMap = new Map<string, { count: number; firstRequestAt: number }>();

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry) {
    rateMap.set(key, { count: 1, firstRequestAt: now });
    return next();
  }

  if (now - entry.firstRequestAt > rateLimitWindowMs) {
    rateMap.set(key, { count: 1, firstRequestAt: now });
    return next();
  }

  if (entry.count >= rateLimitMax) {
    res.setHeader('Retry-After', String(Math.ceil((rateLimitWindowMs - (now - entry.firstRequestAt)) / 1000)));
    return res.status(429).json({ error: 'Erro inesperado, tente novamente mais tarde.' });
  }

  entry.count += 1;
  rateMap.set(key, entry);
  next();
}

app.use('/api', rateLimiter);
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
    return res.status(415).json({ error: 'Unsupported content type' });
  }
  next();
});

app.use('/api/assets', express.static(path.resolve(__dirname, '../../site/public/assets'), {
  setHeaders(res) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

app.get('/api/site-logo', (_req, res) => {
  res.sendFile(logoPath, (err) => {
    if (err) {
      console.error('Failed to send site logo:', err);
      res.status(404).send('Logo not found');
    }
  });
});

app.get('/footer-text', (_req, res) => {
  try {
    const file = fs.readFileSync(footerTextPath, 'utf-8');
    const data = JSON.parse(file);
    res.json({ copyright: data.copyright });
  } catch (err) {
    console.error('Failed to read footer text file:', err);
    res.status(500).json({ copyright: '©Saldo Verde | Todos os direitos reservados.' });
  }
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not both set. Supabase routes will be disabled.');
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/profile/:id', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase is not configured' });
  }

  const userId = req.params.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.json({ profile: data });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
