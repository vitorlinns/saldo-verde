import express, { type Express } from 'express';
import fs from 'fs';

export function registerSiteRoutes(app: Express, assetsPath: string, footerTextPath: string, logoPath: string) {
  app.use('/api/assets', express.static(assetsPath, {
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
}
