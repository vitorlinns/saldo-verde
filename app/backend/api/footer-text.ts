import fs from 'fs';
import path from 'path';
import { handleOptions, sendJson } from './_http';

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  try {
    const footerTextPath = path.join(process.cwd(), '..', '..', 'src', 'data', 'site-info.json');
    const file = fs.readFileSync(footerTextPath, 'utf-8');
    const data = JSON.parse(file);
    return sendJson(res, 200, {
      copyright: data.copyright ?? '© 2026 Saldo Verde. Todos os direitos reservados.',
    });
  } catch (error) {
    console.error('Failed to read footer text file:', error);
    return sendJson(res, 200, {
      copyright: '© 2026 Saldo Verde. Todos os direitos reservados.',
    });
  }
}