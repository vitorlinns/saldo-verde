import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSessionUser } from '../lib/auth';

const pad2 = (n: number) => String(n).padStart(2, '0');

const formatDate = (d: Date) => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
const formatTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}H`;

const formatAmount = (amountCents: number, type: 'income' | 'expense') => {
  const abs = Math.abs(amountCents / 100);
  const formatted = abs.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${type === 'income' ? '+' : '-'} R$ ${formatted}`;
};

const mapRow = (row: Record<string, unknown>) => {
  const occurredAt = new Date(row.occurred_at as string);
  return {
    id: row.id as string,
    type: row.record_type as 'income' | 'expense',
    title: row.title as string,
    category: row.category as string,
    amount: formatAmount(row.amount_cents as number, row.record_type as 'income' | 'expense'),
    date: formatDate(occurredAt),
    time: formatTime(occurredAt),
    note: row.note as string,
  };
};

const VALID_TYPES = new Set(['income', 'expense']);
const MAX_TITLE_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 50;
const MAX_NOTE_LENGTH = 500;
const MAX_AMOUNT_CENTS = 1_000_000_000; // R$ 10 million
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePositiveInt = (value: unknown, fallback: number) => {
  if (typeof value !== 'string') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export function registerRecordsRoutes(app: Express, supabase: SupabaseClient | null) {
  // GET /api/records
  app.get('/api/records', async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço indisponível.' });
    }

    const user = await getSessionUser(supabase, req);
    if (!user) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = Math.min(parsePositiveInt(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('financial_records')
      .select('id, record_type, title, category, amount_cents, note, occurred_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false });

    const { type, month, year, day } = req.query;

    if (typeof type === 'string' && VALID_TYPES.has(type)) {
      query = query.eq('record_type', type);
    }

    if (typeof year === 'string' && /^\d{4}$/.test(year)) {
      const start = `${year}-01-01T00:00:00.000Z`;
      const end = `${year}-12-31T23:59:59.999Z`;
      query = query.gte('occurred_at', start).lte('occurred_at', end);
    }

    if (typeof month === 'string' && typeof year === 'string' && /^\d{1,2}$/.test(month) && /^\d{4}$/.test(year)) {
      const m = month.padStart(2, '0');
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
      const start = `${year}-${m}-01T00:00:00.000Z`;
      const end = `${year}-${m}-${pad2(daysInMonth)}T23:59:59.999Z`;
      query = query.gte('occurred_at', start).lte('occurred_at', end);
    }

    // Day filter depends on formatted date and can be timezone-sensitive.
    // For correctness we apply it after mapping and then paginate in memory.
    if (typeof day === 'string' && /^\d{1,2}$/.test(day)) {
      const { data, error } = await query;
      if (error) {
        return res.status(500).json({ error: 'Não foi possível carregar os registros.' });
      }

      const paddedDay = day.padStart(2, '0');
      const filtered = (data ?? []).map(mapRow).filter((r) => r.date.startsWith(`${paddedDay}/`));
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const records = filtered.slice(offset, offset + limit);

      return res.json({
        records,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    }

    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: 'Não foi possível carregar os registros.' });
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.json({
      records: (data ?? []).map(mapRow),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  });

  // POST /api/records
  app.post('/api/records', async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço indisponível.' });
    }

    const user = await getSessionUser(supabase, req);
    if (!user) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    const { type, title, category, amount_cents, note, occurred_at } = req.body as Record<string, unknown>;

    if (typeof type !== 'string' || !VALID_TYPES.has(type)) {
      return res.status(400).json({ error: 'Tipo inválido. Use "income" ou "expense".' });
    }
    if (typeof title !== 'string' || !title.trim() || title.length > MAX_TITLE_LENGTH) {
      return res.status(400).json({ error: 'Título inválido.' });
    }
    if (typeof category !== 'string' || !category.trim() || category.length > MAX_CATEGORY_LENGTH) {
      return res.status(400).json({ error: 'Categoria inválida.' });
    }
    if (typeof amount_cents !== 'number' || !Number.isInteger(amount_cents) || amount_cents < 0 || amount_cents > MAX_AMOUNT_CENTS) {
      return res.status(400).json({ error: 'Valor inválido.' });
    }
    if (typeof note !== 'string' || note.length > MAX_NOTE_LENGTH) {
      return res.status(400).json({ error: 'Nota inválida.' });
    }

    const occurredAtDate =
      typeof occurred_at === 'string' && occurred_at
        ? new Date(occurred_at)
        : new Date();

    if (isNaN(occurredAtDate.getTime())) {
      return res.status(400).json({ error: 'Data inválida.' });
    }

    const { data, error } = await supabase
      .from('financial_records')
      .insert({
        user_id: user.id,
        record_type: type,
        title: title.trim(),
        category: category.trim(),
        amount_cents,
        note: note.trim(),
        occurred_at: occurredAtDate.toISOString(),
      })
      .select('id, record_type, title, category, amount_cents, note, occurred_at')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Erro ao salvar o registro.' });
    }

    return res.status(201).json({ record: mapRow(data as Record<string, unknown>) });
  });

  // DELETE /api/records/:id
  app.delete('/api/records/:id', async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço indisponível.' });
    }

    const user = await getSessionUser(supabase, req);
    if (!user) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    const { id } = req.params;

    // Basic UUID validation to prevent injection
    if (!/^[0-9a-f-]{36}$/.test(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return res.status(500).json({ error: 'Erro ao excluir o registro.' });
    }

    return res.json({ ok: true });
  });
}
