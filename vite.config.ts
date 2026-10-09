import { defineConfig, type Plugin } from "vite";
import { appendFileSync, mkdirSync } from "node:fs";

/** In development the contact form posts here and the message lands in .data/contact.jsonl, so the whole flow can be tried.
 *  In production, point VITE_CONTACT_ENDPOINT at a form service or a function that forwards to your inbox. */
function contactDev(): Plugin {
  return {
    name: "contact-dev",
    configureServer(server) {
      server.middlewares.use("/api/contact", (req, res) => {
        if (req.method !== "POST") { res.statusCode = 405; res.end(); return; }
        let body = "";
        req.on("data", (c) => { body += c; });
        req.on("end", () => {
          try {
            const msg = JSON.parse(body);
            mkdirSync(".data", { recursive: true });
            appendFileSync(".data/contact.jsonl", JSON.stringify({ at: new Date().toISOString(), ...msg }) + "\n");
            res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ ok: true }));
          } catch { res.statusCode = 400; res.end(); }
        });
      });
    },
  };
}

export default defineConfig({ plugins: [contactDev()] });
