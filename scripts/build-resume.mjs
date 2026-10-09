// Writes public/resume.json and public/resume.md from src/resume.ts (one source for the page and the plain copies).
import { writeFileSync } from "node:fs";
const { PERSON, ENTRIES } = await import("../src/resume.ts");
writeFileSync("public/resume.json", JSON.stringify({ ...PERSON, entries: ENTRIES.map(({ years, org, role, place, line, roles, detail, href }) => ({ years, org, role, place, line, roles, detail, href })) }, null, 2));
const md = [`# ${PERSON.name}`, `${PERSON.line} · ${PERSON.location}`, `${PERSON.email} · ${PERSON.links.linkedin} · ${PERSON.links.github}`, "", PERSON.summary, "", "## Experience", "",
  ...ENTRIES.flatMap((e) => [`### ${e.org} · ${e.years}`, `${e.role}${e.place ? ` · ${e.place}` : ""}`, ...(e.roles ? [e.roles.join(" · ")] : []), "", e.line, ...(e.detail ? ["", ...e.detail.map((d) => `- ${d}`)] : []), ""]),
].join("\n");
writeFileSync("public/resume.md", md);
console.log("wrote resume.json and resume.md");
