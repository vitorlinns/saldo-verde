type SessionDeviceRow = {
  id?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  not_after?: string | null;
};

function normalizeDeviceValue(value?: string | null) {
  return value?.trim().replace(/\s+/g, ' ').toLowerCase() ?? '';
}

export function countUniqueConnectedDevices(rows: SessionDeviceRow[] | null | undefined) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return 0;
  }

  const devices = new Set<string>();

  for (const row of rows) {
    const ip = normalizeDeviceValue(row.ip);
    const userAgent = normalizeDeviceValue(row.user_agent);

    if (ip || userAgent) {
      devices.add(`${ip || 'unknown-ip'}::${userAgent || 'unknown-agent'}`);
      continue;
    }

    devices.add(row.id ?? crypto.randomUUID());
  }

  return devices.size;
}

export function filterActiveSessionRows(rows: SessionDeviceRow[] | null | undefined, now = new Date()) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  return rows.filter((row) => {
    if (!row.not_after) {
      return true;
    }

    const expiresAt = new Date(row.not_after);
    if (Number.isNaN(expiresAt.getTime())) {
      return true;
    }

    return expiresAt > now;
  });
}