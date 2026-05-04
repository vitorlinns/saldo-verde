import { createSupabaseClient } from './_supabase';
import { getSessionUser } from './_auth';
import { handleOptions, sendJson } from './_http';

type RecordType = 'income' | 'expense';

type FinancialRecordRow = {
  id: string;
  record_type: RecordType;
  title: string;
  category: string;
  amount_cents: number;
  note: string;
  occurred_at: string;
};

const VALID_TYPES = new Set(['income', 'expense']);
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const env = (globalThis as any)?.process?.env ?? {};

const pad2 = (n: number) => String(n).padStart(2, '0');
const formatDate = (d: Date) => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
const formatTime = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}H`;

const parsePositiveInt = (value: unknown, fallback: number) => {
  if (typeof value !== 'string') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const formatAmount = (amountCents: number, type: RecordType) => {
  const abs = Math.abs(amountCents / 100);
  const formatted = abs.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${type === 'income' ? '+' : '-'} R$ ${formatted}`;
};

const mapRow = (row: FinancialRecordRow) => {
  const occurredAt = new Date(row.occurred_at);
  return {
    id: row.id,
    type: row.record_type,
    title: row.title,
    category: row.category,
    amount: formatAmount(row.amount_cents, row.record_type),
    date: formatDate(occurredAt),
    time: formatTime(occurredAt),
    note: row.note,
  };
};

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const user = await getSessionUser(req);
  if (!user) {
    return sendJson(res, 401, { error: 'Sessão inválida.' });
  }

  const supabase = createSupabaseClient();

  if (req.method === 'GET') {
    const page = parsePositiveInt(req.query?.page, DEFAULT_PAGE);
    const limit = Math.min(parsePositiveInt(req.query?.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const offset = (page - 1) * limit;

    const type = req.query?.type;
    const month = req.query?.month;
    const year = req.query?.year;
    const day = req.query?.day;

    let query = supabase
      .from('financial_records')
      .select('id, record_type, title, category, amount_cents, note, occurred_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false });

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

    if (typeof day === 'string' && /^\d{1,2}$/.test(day)) {
      const { data, error } = await query;
      if (error) {
        return sendJson(res, 500, { error: 'Não foi possível carregar os registros.' });
      }

      const paddedDay = day.padStart(2, '0');
      const filtered = ((data ?? []) as FinancialRecordRow[])
        .map(mapRow)
        .filter((r) => r.date.startsWith(`${paddedDay}/`));

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const records = filtered.slice(offset, offset + limit);

      return sendJson(res, 200, {
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
      return sendJson(res, 500, { error: 'Não foi possível carregar os registros.' });
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return sendJson(res, 200, {
      records: ((data ?? []) as FinancialRecordRow[]).map(mapRow),
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

  const allowedOrigins = new Set(
    [
      env.FRONTEND_ORIGIN,
      ...(String(env.FRONTEND_ORIGINS ?? '')
        .split(',')
        .map((o: string) => o.trim())),
    ].filter((v): v is string => Boolean(v)),
  );
  const origin = req.headers?.origin;
  if (origin && allowedOrigins.size > 0 && !allowedOrigins.has(origin)) {
    return sendJson(res, 403, { error: 'Forbidden origin' });
  }

  const { type, title, category, amount_cents, note, occurred_at } = req.body ?? {};

  if (typeof type !== 'string' || !VALID_TYPES.has(type)) {
    return sendJson(res, 400, { error: 'Tipo inválido. Use "income" ou "expense".' });
  }
  if (typeof title !== 'string' || !title.trim() || title.length > 100) {
    return sendJson(res, 400, { error: 'Título inválido.' });
  }
  if (typeof category !== 'string' || !category.trim() || category.length > 50) {
    return sendJson(res, 400, { error: 'Categoria inválida.' });
  }
  if (typeof amount_cents !== 'number' || !Number.isInteger(amount_cents) || amount_cents < 0 || amount_cents > 1_000_000_000) {
    return sendJson(res, 400, { error: 'Valor inválido.' });
  }
  if (typeof note !== 'string' || note.length > 500) {
    return sendJson(res, 400, { error: 'Nota inválida.' });
  }

  const occurredAtDate = typeof occurred_at === 'string' && occurred_at ? new Date(occurred_at) : new Date();
  if (Number.isNaN(occurredAtDate.getTime())) {
    return sendJson(res, 400, { error: 'Data inválida.' });
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
    return sendJson(res, 500, { error: 'Erro ao salvar o registro.' });
  }

  return sendJson(res, 201, {
    record: mapRow(data as FinancialRecordRow),
  });
}
