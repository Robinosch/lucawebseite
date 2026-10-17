import { createHmac } from 'node:crypto';

interface ReservationPayload {
  name: string;
  email: string;
  phone: string;
  packageId: string;
  packageTitle: string;
  quantity: number;
  preferredBatch: string;
  customWishes?: string;
  recaptchaToken: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body: ReservationPayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // 1. Pflichtfelder serverseitig validieren
    if (!body?.name || !body?.email || !body?.packageTitle || !body?.recaptchaToken) {
      return res.status(400).json({ error: 'Bitte füllen Sie alle Pflichtfelder aus.' });
    }

    const quantity = Math.max(1, Math.min(10, Number(body.quantity) || 1));
    const reservationId = `WF-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    // 2. reCAPTCHA v2 serverseitig verifizieren (falls RECAPTCHA_SECRET_KEY gesetzt ist)
    const recaptchaSecret = process.env['RECAPTCHA_SECRET_KEY'];
    if (recaptchaSecret) {
      const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
      const params = new URLSearchParams({
        secret: recaptchaSecret,
        response: body.recaptchaToken
      });

      const captchaRes = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const captchaData: any = await captchaRes.json();

      if (!captchaData.success) {
        return res.status(400).json({ error: 'reCAPTCHA-Überprüfung fehlgeschlagen.' });
      }
    }

    // 3. Kryptografisch signierte Admin-Aktionslinks (Bestätigen / Absagen) generieren
    const adminSecret = process.env['ADMIN_SECRET'] || 'dev-fallback-secret-bitte-in-vercel-aendern';
    const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost:4200';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const createActionUrl = (action: 'accept' | 'decline') => {
      const dataString = `${reservationId}|${action}|${body.email.trim()}|${body.name.trim()}|${body.packageTitle}|${quantity}`;
      const sig = createHmac('sha256', adminSecret).update(dataString).digest('hex');

      const query = new URLSearchParams({
        id: reservationId,
        action,
        email: body.email.trim(),
        name: body.name.trim(),
        pkg: body.packageTitle,
        qty: String(quantity),
        sig
      });
      return `${baseUrl}/api/confirm?${query.toString()}`;
    };

    const acceptUrl = createActionUrl('accept');
    const declineUrl = createActionUrl('decline');

    // 4. E-Mails über Resend API versenden
    const resendApiKey = process.env['RESEND_API_KEY'];
    const ownerEmail = process.env['OWNER_EMAIL'] || 'info@highlander-weetfeld.de';
    const fromEmail = process.env['FROM_EMAIL'] || 'Highlander vom Weetfeld <onboarding@resend.dev>';

    if (resendApiKey) {
      // 4a. E-Mail an Familie Gebel (Inhaber/Admin) MIT KLICKBAREN BESTÄTIGUNGS-BUTTONS
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [ownerEmail],
          reply_to: body.email.trim(),
          subject: `🥩 Neue Fleisch-Reservierung [${reservationId}]: ${quantity}x ${body.packageTitle}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d8e0d7; border-radius: 12px; overflow: hidden;">
              <div style="background: #214b2b; color: #ffffff; padding: 20px 24px;">
                <h2 style="margin: 0;">Neue Reservierungsanfrage (${reservationId})</h2>
                <p style="margin: 4px 0 0; opacity: 0.9;">Highlander vom Weetfeld – Direktvermarktung</p>
              </div>
              <div style="padding: 24px; color: #243027; line-height: 1.6;">
                <p>Es ist eine neue unverbindliche Reservierung über die Webseite eingegangen:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Reservierungs-Nr.:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${reservationId}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Kunde:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${body.name}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>E-Mail:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${body.email}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Telefon:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${body.phone || 'Nicht angegeben'}</td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Gewünschtes Paket:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>${quantity}x ${body.packageTitle}</strong></td></tr>
                  <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Wunsch-Termin:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${body.preferredBatch}</td></tr>
                  <tr><td style="padding: 8px 0;"><strong>Anmerkungen / Teilstücke:</strong></td><td style="padding: 8px 0;">${body.customWishes || 'Keine besonderen Anmerkungen'}</td></tr>
                </table>

                <div style="background: #f4f8f2; padding: 18px; border-radius: 10px; margin-top: 24px; text-align: center;">
                  <p style="margin: 0 0 14px; font-weight: bold;">Direkt-Aktion für Inhaber (sendet automatisch Mail an den Kunden):</p>
                  <a href="${acceptUrl}" style="display: inline-block; background: #2e7d32; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: bold; margin: 6px;">
                    ✅ Reservierung bestätigen
                  </a>
                  <a href="${declineUrl}" style="display: inline-block; background: #c62828; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: bold; margin: 6px;">
                    ❌ Aktuell vergriffen / Warteliste
                  </a>
                </div>
              </div>
            </div>
          `
        })
      });

      // 4b. Automatische Eingangsbestätigung an den Kunden
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [body.email.trim()],
          subject: `Ihre Reservierungsanfrage (${reservationId}) – Highlander vom Weetfeld`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d8e0d7; border-radius: 12px; overflow: hidden;">
              <div style="background: #214b2b; color: #ffffff; padding: 20px 24px;">
                <h2 style="margin: 0;">Vielen Dank für Ihre Anfrage!</h2>
                <p style="margin: 4px 0 0; opacity: 0.9;">Highlander vom Weetfeld – Familie Gebel</p>
              </div>
              <div style="padding: 24px; color: #243027; line-height: 1.6;">
                <p>Hallo ${body.name},</p>
                <p>wir haben Ihre unverbindliche Reservierungsanfrage unter der Nummer <strong>${reservationId}</strong> erhalten:</p>
                <ul>
                  <li><strong>Auswahl:</strong> ${quantity}x ${body.packageTitle}</li>
                  <li><strong>Zeitraum:</strong> ${body.preferredBatch}</li>
                </ul>
                <p>Wir prüfen nun unser verfügbares Kontingent für den nächsten Schlachttermin. Sobald wir Ihre Reservierung einplanen können, erhalten Sie von uns eine offizielle Bestätigung per E-Mail.</p>
                <p style="margin-top: 24px;">Herzliche Grüße aus Hamm-Weetfeld<br><strong>Familie Gebel</strong><br>Provinzialstraße 29 · 59077 Hamm</p>
              </div>
            </div>
          `
        })
      });
    }

    return res.status(200).json({
      success: true,
      reservationId
    });
  } catch (error) {
    console.error('Fehler in /api/reserve:', error);
    return res.status(500).json({ error: 'Interner Serverfehler bei der Reservierung.' });
  }
}
