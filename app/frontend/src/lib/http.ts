export async function safeParseJson<T = unknown>(response: Response): Promise<T | { error: string }> {
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    return { error: text || 'Resposta inválida do servidor.' } as { error: string };
  }
}
