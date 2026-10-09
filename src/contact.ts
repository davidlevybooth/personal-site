// Contact: one line, one form, four marks. The address is never on the page; the form posts to an endpoint
// (VITE_CONTACT_ENDPOINT, or /api/contact which the dev server answers and writes to .data/contact.jsonl).
import { siGithub, siGooglescholar, siSubstack } from "simple-icons";

const ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined) ?? "/api/contact";

// LinkedIn is no longer in simple-icons; this is a plain "in" in a rounded square at the same optical weight.
const LINKEDIN = "M19 2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zM8.4 18H6V9.6h2.4V18zM7.2 8.5a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8zM18 18h-2.4v-4.1c0-1-.1-2.2-1.4-2.2s-1.6 1.1-1.6 2.2V18h-2.4V9.6h2.3v1.1h.1c.3-.6 1.1-1.3 2.3-1.3 2.5 0 2.9 1.6 2.9 3.7V18z";

const MARKS = [
  { label: "LinkedIn", href: "https://linkedin.com/in/david-levy-booth", path: LINKEDIN },
  { label: "GitHub", href: "https://github.com/davidlevybooth", path: siGithub.path },
  { label: "Google Scholar", href: "https://scholar.google.com/citations?user=RYr0usAAAAAJ&hl=en", path: siGooglescholar.path },
  { label: "Substack", href: "https://substack.com/@davidlevybooth", path: siSubstack.path },
];

export function mountContact(root: HTMLElement) {
  root.innerHTML = `
    <div class="chapter-k">04 <em>Contact</em></div>
    <div class="contact">
      <h2>Say hello</h2>
      <form class="say touch" novalidate>
        <label class="field"><span>Your email</span><input name="email" type="email" autocomplete="email" required placeholder="you@lab.org" /></label>
        <label class="field"><span>Message</span><textarea name="message" rows="4" required placeholder="What are you working on?"></textarea></label>
        <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div class="say-foot">
          <button class="send" type="submit"><span class="send-t">Send</span><i class="send-dots"><b></b><b></b><b></b></i></button>
          <div class="say-note" aria-live="polite"></div>
        </div>
      </form>
      <nav class="marks" aria-label="Elsewhere">
        ${MARKS.map((m) => `<a class="mark touch" href="${m.href}" target="_blank" rel="noopener" aria-label="${m.label}" title="${m.label}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="${m.path}" /></svg></a>`).join("")}
      </nav>
      <div class="plain">Resume <a class="touch" href="/resume.pdf" download>PDF</a> · <a class="touch" href="/resume.json" download>JSON</a> · <a class="touch" href="/resume.md" download>Markdown</a></div>
    </div>`;
  const form = root.querySelector<HTMLFormElement>("form")!;
  const note = root.querySelector<HTMLElement>(".say-note")!;
  const send = root.querySelector<HTMLButtonElement>(".send")!;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (data.get("website")) { note.textContent = "Sent."; form.reset(); return; }   // a bot filled the hidden field
    const email = String(data.get("email") ?? "").trim(), message = String(data.get("message") ?? "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { note.textContent = "That email doesn't look right."; return; }
    if (message.length < 2) { note.textContent = "Say a little more."; return; }
    send.disabled = true; form.classList.add("is-sending"); note.textContent = "";
    try {
      const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email, message, page: location.href }) });
      if (!res.ok) throw new Error(String(res.status));
      form.reset(); note.textContent = "Sent. I read everything.";
    } catch {
      note.textContent = "Didn't send. Try again, or find me on LinkedIn.";
    } finally { send.disabled = false; form.classList.remove("is-sending"); }
  });
}
