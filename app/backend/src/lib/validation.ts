export const normalizeDigits = (value: string) => value.replace(/\D/g, '');
export const isDigits = (value: string) => /^\d+$/.test(value);

export const isValidCpf = (value: string) => {
  const digits = normalizeDigits(value);
  if (digits.length !== 11 || !isDigits(digits)) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const cpfNumbers = digits.split('').map(Number);

  const calculateVerifier = (length: number) => {
    const factorStart = length + 1;
    const sum = cpfNumbers
      .slice(0, length)
      .reduce((acc, digit, index) => acc + digit * (factorStart - index), 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstVerifier = calculateVerifier(9);
  const secondVerifier = calculateVerifier(10);

  return firstVerifier === cpfNumbers[9] && secondVerifier === cpfNumbers[10];
};

export const isValidPhone = (value: string) => {
  const digits = normalizeDigits(value);
  return digits.length >= 10 && digits.length <= 15 && isDigits(digits);
};

export const isValidCep = (value: string) => normalizeDigits(value).length === 8 && isDigits(normalizeDigits(value));

export const parseBirthdate = (value: string) => {
  const normalized = value.trim();
  const parts = normalized.split('/').map((part) => Number(part));
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  if (!day || !month || !year) return null;
  const birthDate = new Date(year, month - 1, day);
  if (Number.isNaN(birthDate.getTime())) return null;
  if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) return null;
  return birthDate;
};

export const getAge = (birthDate: Date) => {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age;
};

export const isValidBirthdate = (value: string) => {
  const birthDate = parseBirthdate(value);
  if (!birthDate) return false;
  if (birthDate > new Date()) return false;
  return getAge(birthDate) >= 18;
};
