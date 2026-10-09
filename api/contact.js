// Vercel function behind the contact form. The address lives only in the environment, never in the page.
// Set RESEND_API_KEY and CONTACT_TO (and optionally CONTACT_FROM) to get email, or CONTACT_WEBHOOK to post the
// message as JSON to a Slack, Discord or other webhook. With neither set it answers 503 and the form says so.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { email, message, page, website } = req.body ?? {};
  if (website) return res.status(200).json({ ok: true });                       // honeypot: a bot filled the hidden field
  if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "email" });
  if (typeof message !== "string" || message.trim().length < 2 || message.length > 5000) return res.status(400).json({ error: "message" });

  const text = `From: ${email}\nPage: ${page ?? ""}\n\n${message.trim()}`;
  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM, CONTACT_WEBHOOK } = process.env;
  try {
    if (RESEND_API_KEY && CONTACT_TO) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: CONTACT_FROM ?? "Site <onboarding@resend.dev>", to: [CONTACT_TO], reply_to: email, subject: `Site: ${message.trim().slice(0, 60)}`, text }),
      });
      if (!r.ok) throw new Error(`resend ${r.status}`);
    } else if (CONTACT_WEBHOOK) {
      const r = await fetch(CONTACT_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, content: text, email, message, page }) });
      if (!r.ok) throw new Error(`webhook ${r.status}`);
    } else {
      return res.status(503).json({ error: "not configured" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "send failed" });
  }
}
