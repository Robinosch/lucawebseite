import { createHmac } from 'node:crypto';

export default async function handler(req: any, res: any) {
  const { id, action, email, name, pkg, qty, sig } = req.query || {};

  if (!id || !action || !email || !name || !pkg || !qty || !sig) {
    return res.status(400).send('Ungültiger Link: Parameter fehlen.');
  }

  // 1. Kryptografische Signatur prüfen (stellt sicher, dass nur der Inhaber klicken konnte)
  const adminSecret = process.env['ADMIN_SECRET'] || 'dev-fallback-secret-bitte-in-vercel-aendern';
  const dataString = `${id}|${action}|${email}|${name}|${pkg}|${qty}`;
  const expectedSig = createHmac('sha256', adminSecret).update(dataString).digest('hex');

  if (sig !== expectedSig) {
    return res.status(403).send(`
      <html lang="de"><body style="font-family:sans-serif;text-align:center;padding:60px;">
        <h1 style="color:#c62828;">⛔ Zugriff verweigert (Ungültige Signatur)</h1>
        <p>Dieser Bestätigungslink ist ungültig oder wurde verändert.</p>
      </body></html>
    `);
  }

  const isAccepted = action === 'accept';
  const resendApiKey = process.env['RESEND_API_KEY'];
  const fromEmail = process.env['FROM_EMAIL'] || 'Highlander vom Weetfeld <onboarding@resend.dev>';

  // 2. Status-Mail an den Kunden senden
  if (resendApiKey) {
    const subject = isAccepted
      ? `✅ Reservierung bestätigt (${id}) – Highlander vom Weetfeld`
      : `Information zu Ihrer Anfrage (${id}) – Highlander vom Weetfeld`;

    const htmlBody = isAccepted
      ? `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d8e0d7; border-radius: 12px; overflow: hidden;">
          <div style="background: #2e7d32; color: #ffffff; padding: 20px 24px;">
            <h2 style="margin: 0;">Ihre Reservierung ist bestätigt!</h2>
          </div>
          <div style="padding: 24px; color: #243027; line-height: 1.6;">
            <p>Hallo ${name},</p>
            <p>gute Nachrichten! Wir haben Ihre Reservierung (Nr. <strong>${id}</strong>) über <strong>${qty}x ${pkg}</strong> verbindlich für unseren nächsten Termin vorgemerkt.</p>
            <p>Wir melden uns rechtzeitig vor dem Abholtermin noch einmal persönlich bei Ihnen, um den genauen Tag der Übergabe auf unserem Hof (Provinzialstraße 29, 59077 Hamm) abzustimmen.</p>
            <p style="margin-top: 24px;">Herzliche Grüße<br><strong>Familie Gebel – Highlander vom Weetfeld</strong></p>
          </div>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d8e0d7; border-radius: 12px; overflow: hidden;">
          <div style="background: #765746; color: #ffffff; padding: 20px 24px;">
            <h2 style="margin: 0;">Rückmeldung zu Ihrer Anfrage (${id})</h2>
          </div>
          <div style="padding: 24px; color: #243027; line-height: 1.6;">
            <p>Hallo ${name},</p>
            <p>vielen Dank für Ihr großes Interesse an unserem Highland-Cattle-Fleisch (Anfrage: <strong>${qty}x ${pkg}</strong>).</p>
            <p>Da wir nur eine sehr begrenzte Anzahl an Tieren pro Jahr schlachten, ist das Kontingent für den kommenden Termin leider bereits vollständig vergeben. Wir haben Sie jedoch gerne auf unsere Interessentenliste gesetzt und informieren Sie, sobald wieder Pakete verfügbar sind.</p>
            <p style="margin-top: 24px;">Herzliche Grüße<br><strong>Familie Gebel – Highlander vom Weetfeld</strong></p>
          </div>
        </div>
      `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject,
        html: htmlBody
      })
    });
  }

  // 3. Schöne Bestätigungsseite im Browser für Familie Gebel anzeigen
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reservierung ${isAccepted ? 'bestätigt' : 'abgesagt'} – Highlander vom Weetfeld</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #fbf7ef; color: #243027; display: grid; place-items: center; min-height: 90vh; margin: 0; padding: 20px; }
          .card { background: #fff; max-width: 520px; width: 100%; padding: 32px; border-radius: 16px; box-shadow: 0 12px 32px rgba(36,60,42,0.12); text-align: center; border-top: 6px solid ${isAccepted ? '#2e7d32' : '#765746'}; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 99px; font-weight: 700; font-size: 0.85rem; background: ${isAccepted ? '#dcebdc' : '#eee5d5'}; color: ${isAccepted ? '#214b2b' : '#563d32'}; margin-bottom: 16px; }
          h1 { margin: 0 0 12px; font-size: 1.5rem; }
          p { color: #58655a; line-height: 1.6; }
          .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #356b3d; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">Reservierung ${id}</span>
          <h1>${isAccepted ? '✅ Erfolgreich bestätigt!' : 'ℹ️ Wartelisten-Info gesendet'}</h1>
          <p>
            Die E-Mail für <strong>${qty}x ${pkg}</strong> wurde automatisch an
            <strong>${name}</strong> (${email}) verschickt.
          </p>
          <a class="btn" href="/">Zurück zur Webseite</a>
        </div>
      </body>
    </html>
  `);
}
