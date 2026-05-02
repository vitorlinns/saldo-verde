const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL ?? 'no-reply@saldoverde.pro';

export async function sendRecoveryEmail(to: string, code: string) {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const body = {
    from: resendFrom,
    to,
    subject: 'Recuperação de conta Saldo Verde',
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; color: #111;">
        <h1 style="font-size: 22px; color: #0f766e;">Recuperação de conta</h1>
        <p>Use o código abaixo para continuar sua recuperação de conta no Saldo Verde.</p>
        <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border: 1px solid #94a3b8; border-radius: 14px; display: inline-block;">
          <strong style="font-size: 24px; letter-spacing: 0.1em;">${code}</strong>
        </div>
        <p>Esse código expira em 15 minutos.</p>
        <p>Se você não solicitou essa recuperação, ignore este email.</p>
      </div>
    `,
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  } as RequestInit);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${text}`);
  }
}
