export type RecordType = 'income' | 'expense';

export interface RecordItem {
  type: RecordType;
  title: string;
  category: string;
  amount: string;
  date: string;
  time: string;
  note: string;
}

const STORAGE_KEY = 'saldo-verde-records';
const BALANCE_KEY = 'saldo-verde-balance';

const pad2 = (value: number) => String(value).padStart(2, '0');

const monthLabels = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export interface MonthlySummary {
  monthKey: string;
  label: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  recordCount: number;
}

export const getStoredBalance = () => {
  if (!isBrowser()) return 0;

  const raw = localStorage.getItem(BALANCE_KEY);
  if (!raw) return 0;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const saveBalance = (balance: number) => {
  if (!isBrowser()) return;
  localStorage.setItem(BALANCE_KEY, String(balance));
};

export const updateBalance = (delta: number) => {
  const current = getStoredBalance();
  const updated = current + delta;
  saveBalance(updated);
  return updated;
};

export const parseAmount = (value: string) => {
  const numeric = value.replace(/[^0-9-,\.]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(numeric);
  return Math.abs(Number.isFinite(parsed) ? parsed : 0);
};

const formatAmount = (value: number, type: RecordType) => {
  const amount = Math.abs(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${type === 'income' ? '+' : '-'} R$ ${amount}`;
};

export const formatAmountFromInput = (amountInput: string, type: RecordType) => {
  const cleaned = amountInput
    .replace(/\s+/g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');

  const parsed = parseFloat(cleaned);
  if (Number.isNaN(parsed)) {
    return formatAmount(0, type);
  }

  return formatAmount(parsed, type);
};

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const getStoredRecords = (): RecordItem[] => {
  if (!isBrowser()) {
    return [];
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as RecordItem[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // ignore invalid JSON
  }

  return [];
};

export const saveRecords = (records: RecordItem[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const addRecord = (record: RecordItem) => {
  const current = getStoredRecords();
  const updated = [record, ...current];
  saveRecords(updated);

  const delta = record.type === 'income' ? parseAmount(record.amount) : -parseAmount(record.amount);
  updateBalance(delta);

  return updated;
};

export const getAllMonthlySummaries = (): MonthlySummary[] => {
  const summaries = new Map<string, MonthlySummary>();

  getStoredRecords().forEach((record) => {
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

export interface MonthlySummaryFilter {
  month?: string;
  year?: string;
}

export const getMonthlySummaries = (
  limit = 6,
  filter?: MonthlySummaryFilter,
): MonthlySummary[] => {
  const summaries = getAllMonthlySummaries();

  const filtered = filter
    ? summaries.filter((summary) => {
        if (filter.month && filter.year) {
          const monthKey = `${filter.year}-${filter.month.padStart(2, '0')}`;
          return summary.monthKey === monthKey;
        }

        if (filter.month) {
          return summary.monthKey.endsWith(`-${filter.month.padStart(2, '0')}`);
        }

        if (filter.year) {
          return summary.monthKey.startsWith(`${filter.year}-`);
        }

        return true;
      })
    : summaries;

  return filtered.slice(0, limit);
};

export const getRecentRecords = (count = 6): Array<Pick<RecordItem, 'type' | 'title' | 'category' | 'amount'>> =>
  getStoredRecords()
    .slice(0, count)
    .map(({ type, title, category, amount }) => ({ type, title, category, amount }));
