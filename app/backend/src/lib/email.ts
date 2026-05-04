const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL;

export async function sendRecoveryEmail(to: string, code: string) {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!resendFrom) {
    throw new Error(
      'RESEND_FROM_EMAIL is not configured. Configure um remetente verificado no Resend e defina RESEND_FROM_EMAIL.'
    );
  }

  const body = {
    from: resendFrom,
    to,
    subject: 'Recuperação de conta Saldo Verde',
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; color: #040404;">
        <h1 style="font-size: 22px; color: #040404;">Recuperação de conta</h1>
        <p>Use o código abaixo para continuar sua recuperação de conta.</p>
        <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border: 1px solid #3e3e3e8e; border-radius: 9px; display: inline-block;">
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
    let errorMessage = `Resend request failed: ${response.status}`;
    try {
      const json = await response.json();
      if (json && typeof json === 'object') {
        if ('error' in json && typeof json.error === 'string') {
          errorMessage += ` ${json.error}`;
        } else if ('message' in json && typeof json.message === 'string') {
          errorMessage += ` ${json.message}`;
        }
      }
    } catch {
      const text = await response.text();
      if (text) {
        errorMessage += ` ${text}`;
      }
    }
    throw new Error(errorMessage);
  }
}
