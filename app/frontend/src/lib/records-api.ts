import type { RecordItem, RecordType } from './records-storage';
import { createClient } from './auth';

const BACKEND_URL = '/api';
const USE_CREDENTIALS: RequestCredentials = 'include';

const refreshSession = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      credentials: USE_CREDENTIALS,
    });
    return response.ok;
  } catch {
    return false;
  }
};

const fetchWithSessionRecovery = async (input: string, init: RequestInit): Promise<Response> => {
  const first = await fetch(input, {
    ...init,
    credentials: USE_CREDENTIALS,
  });

  if (first.status !== 401) {
    return first;
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    return first;
  }

  return fetch(input, {
    ...init,
    credentials: USE_CREDENTIALS,
  });
};

export interface RecordItemWithId extends RecordItem {
  id: string;
}

export interface MonthlySummary {
  monthKey: string;
  label: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  recordCount: number;
}

// ─── helpers ────────────────────────────────────────────────────────────────

export const parseAmount = (value: string) => {
  const numeric = value.replace(/[^0-9-,\.]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(numeric);
  return Math.abs(Number.isFinite(parsed) ? parsed : 0);
};

const amountToInternalCents = (amountFormatted: string) => {
  return Math.round(parseAmount(amountFormatted) * 100);
};

const buildOccurredAt = (date: string, time: string): string => {
  // date: "DD/MM/YYYY", time: "HH:MMH"
  const [day, month, year] = date.split('/');
  const [hourMin] = time.split('H');
  const [hour, min] = (hourMin ?? '00:00').split(':');
  const d = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour ?? 0),
    Number(min ?? 0),
  );
  return d.toISOString();
};

const getAuthHeaders = async () => {
  const headers: Record<string, string> = {};

  try {
    // Ensure Supabase client is initialized before requests that depend on auth.
    createClient();
  } catch {
    // keep request without Authorization header and rely on server cookies
  }

  return headers;
};

// ─── API ─────────────────────────────────────────────────────────────────────

export const addRecordAPI = async (
  record: RecordItem,
): Promise<{ ok: boolean; error?: string; record?: RecordItemWithId }> => {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetchWithSessionRecovery(`${BACKEND_URL}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        type: record.type,
        title: record.title,
        category: record.category,
        amount_cents: amountToInternalCents(record.amount),
        note: record.note,
        occurred_at: buildOccurredAt(record.date, record.time),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        error: (body as { error?: string }).error ?? `Erro ao salvar. (HTTP ${res.status})`,
      };
    }

    const body = await res.json();
    return { ok: true, record: body.record as RecordItemWithId };
  } catch (error) {
    console.error('[records-api] addRecordAPI failed:', error);
    return { ok: false, error: 'Falha de conexão.' };
  }
};

export interface GetRecordsFilters {
  type?: RecordType;
  month?: string;
  year?: string;
  day?: string;
  page?: number;
  limit?: number;
}

export interface RecordsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetRecordsResponse {
  records: RecordItemWithId[];
  pagination: RecordsPagination;
}

export const getRecordsAPI = async (
  filters?: GetRecordsFilters,
): Promise<GetRecordsResponse> => {
  try {
    const authHeaders = await getAuthHeaders();
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.month) params.set('month', filters.month);
    if (filters?.year) params.set('year', filters.year);
    if (filters?.day) params.set('day', filters.day);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchWithSessionRecovery(`${BACKEND_URL}/records${qs}`, {
      headers: authHeaders,
    });

    if (!res.ok) {
      return {
        records: [],
        pagination: {
          page: filters?.page ?? 1,
          limit: filters?.limit ?? 10,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    const body = await res.json();
    const records = Array.isArray(body.records) ? (body.records as RecordItemWithId[]) : [];
    const fallbackPagination: RecordsPagination = {
      page: filters?.page ?? 1,
      limit: filters?.limit ?? (records.length || 10),
      total: records.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return {
      records,
      pagination:
        typeof body.pagination === 'object' && body.pagination
          ? (body.pagination as RecordsPagination)
          : fallbackPagination,
    };
  } catch (error) {
    console.error('[records-api] getRecordsAPI failed:', error);
    return {
      records: [],
      pagination: {
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
};

export const deleteRecordAPI = async (id: string): Promise<{ ok: boolean; error?: string }> => {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetchWithSessionRecovery(`${BACKEND_URL}/records/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: (body as { error?: string }).error ?? 'Erro ao excluir.' };
    }

    return { ok: true };
  } catch (error) {
    console.error('[records-api] deleteRecordAPI failed:', error);
    return { ok: false, error: 'Falha de conexão.' };
  }
};

// ─── pure computation helpers (work on any RecordItem array) ─────────────────

const monthLabels = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export const computeMonthlySummaries = (records: RecordItem[]): MonthlySummary[] => {
  const summaries = new Map<string, MonthlySummary>();

  records.forEach((record) => {
    const [day, month, year] = record.date.split('/');
    if (!day || !month || !year) return;

    const monthKey = `${year}-${month.padStart(2, '0')}`;
    const label = `${monthLabels[Number(month) - 1]} ${year}`;
    const amount = parseAmount(record.amount);
    const income = record.type === 'income' ? amount : 0;
    const expense = record.type === 'expense' ? amount : 0;

    const existing = summaries.get(monthKey);
    if (existing) {
      summaries.set(monthKey, {
        ...existing,
        totalIncome: existing.totalIncome + income,
        totalExpense: existing.totalExpense + expense,
        netAmount: existing.netAmount + income - expense,
        recordCount: existing.recordCount + 1,
      });
    } else {
      summaries.set(monthKey, {
        monthKey,
        label,
        totalIncome: income,
        totalExpense: expense,
        netAmount: income - expense,
        recordCount: 1,
      });
    }
  });

  return Array.from(summaries.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
};

export const computeBalance = (records: RecordItem[]): number =>
  records.reduce((sum, r) => {
    const amount = parseAmount(r.amount);
    return r.type === 'income' ? sum + amount : sum - amount;
  }, 0);
