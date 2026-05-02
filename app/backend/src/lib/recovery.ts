export interface RecoveryEntry {
  email: string;
  code: string;
  expiresAt: number;
  verified: boolean;
}

const recoveryStore = new Map<string, RecoveryEntry>();
const codeTTL = 15 * 60 * 1000; // 15 minutos

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createRecoveryEntry = (email: string) => {
  const code = generateCode();
  const entry: RecoveryEntry = {
    email,
    code,
    expiresAt: Date.now() + codeTTL,
    verified: false,
  };
  recoveryStore.set(email.toLowerCase(), entry);
  return entry;
};

export const getRecoveryEntry = (email: string) => {
  return recoveryStore.get(email.toLowerCase()) ?? null;
};

export const verifyRecoveryCode = (email: string, code: string) => {
  const entry = recoveryStore.get(email.toLowerCase());
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    recoveryStore.delete(email.toLowerCase());
    return false;
  }
  if (entry.code !== code) return false;
  entry.verified = true;
  return true;
};

export const consumeRecoveryEntry = (email: string) => {
  const entry = recoveryStore.get(email.toLowerCase());
  recoveryStore.delete(email.toLowerCase());
  return entry;
};

export const isRecoveryVerified = (email: string) => {
  const entry = recoveryStore.get(email.toLowerCase());
  return entry?.verified ?? false;
};
