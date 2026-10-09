// The resume as data, and the ledger that walks through it: one row per chapter of work, lit as it crosses the middle
// of the screen. The plain copies (PDF, JSON, Markdown) come from this same file through scripts/build-resume.mjs.

export type Entry = {
  years: string; org: string; role: string; place?: string; line: string;
  href?: string; roles?: string[]; detail?: string[];
};

export const PERSON = {
  name: "David Levy-Booth, PhD", line: "AI for biology · rare disease", location: "Canada · remote and US-based roles",
  links: { linkedin: "https://linkedin.com/in/david-levy-booth", github: "https://github.com/davidlevybooth", scholar: "https://scholar.google.com/citations?user=RYr0usAAAAAJ" },
  summary: "Full-stack AI engineer and computational scientist with the goal of bringing novel treatments to patients with rare diseases. I build biological design systems, turn large-scale experimental data into validated designs, and benchmark frontier models for biological safety and capability.",
};

export const ENTRIES: Entry[] = [
  { years: "2022 to now", org: "Dyno Therapeutics", role: "Director, Engineering", place: "Watertown, MA · remote",
    line: "Built Dyno Phi end to end and led the NVIDIA compute partnership behind Dyno Psi-1. Now run a 13-person engineering, ML and data science team and the company's agent program.",
    href: "https://design.dynotx.com",
    roles: ["Director, Engineering (2026 to now)", "Associate Director, Computational Platform (2025 to 2026)", "Principal Scientist (2023 to 2025)", "Senior Scientist (2022 to 2023)"],
    detail: [
      "Technical lead on a $5M+ NVIDIA compute partnership: ported the flow-matching training stack to DGX Cloud and directed the migration behind Dyno Psi-1, a generative folding and binding model at 28% experimental success against about 15% for leading open approaches.",
      "Built Dyno Phi, the company's first computational product: Python backend, Kubernetes and Terraform, an authenticated API, a Next.js front end. Its weighted filters lifted binder-design success to 42% against about 11% for published sets. 100+ monthly users across academia, industry and frontier labs.",
      "Designed millions of binders (miniproteins, VHHs, scFvs) and built the capsid-engineering platform behind Dyno's largest partnered programs, trained on 55B sequence-function measurements across 344 properties.",
      "Led the protein-design evaluation API used by OpenAI and Anthropic to benchmark frontier models against human experts; thousands of biosafety evaluations cited in published model cards.",
      "Manage a 13-person team with a $2.5M compute budget; four agents in production, the design agent in three partnerships and six rare-disease foundations.",
    ] },
  { years: "2020 to 2022", org: "UBC Sequencing & Bioinformatics Core", role: "Head of Bioinformatics", place: "Vancouver",
    line: "Automated the core's sequencing workflows, from QC to single-cell and assembly, and doubled its bioinformatics revenue.",
    detail: ["Launched automated workflows for NGS QC, RNA-Seq, WGS, ChIP-Seq, single-cell, genome assembly and variant calling, and a service platform for UBC and industry.", "Doubled annual bioinformatics revenue with custom genomics, 16S, CRISPR-screen and transcriptomics work."] },
  { years: "2015 to 2020", org: "UBC Microbiology & Immunology", role: "Research Associate", place: "Vancouver",
    line: "A bioproduct discovery platform from mass spectrometry to genome sequencing; seven papers, four first-author, in PNAS and The ISME Journal among them.",
    roles: ["Research Associate (2019 to 2020)", "Hakai Institute Postdoctoral Fellow (2015 to 2019)"],
    detail: ["Built a platform joining mass spectrometry, transcriptomics, protein characterization and large-scale sequencing; $500K+ in Genome BC and NSERC grants."] },
  { years: "2018 to 2020", org: "Microbiome Insights", role: "Consultant", place: "Vancouver",
    line: "Metagenomics and metatranscriptomics pipelines behind a $1.2M research contract, and qPCR assays that followed biotherapeutics through Phase I." },
  { years: "2007 to 2009", org: "Natural Resources Canada, Pacific Forestry Centre", role: "Biologist", place: "Victoria",
    line: "Government of Canada." },
  { years: "2001 to 2014", org: "Study", role: "PhD, Microbial Ecology & Genomics",
    line: "PhD at the University of British Columbia, 2014. MSc, Environmental Microbiology & Biotechnology, University of Guelph, 2007. BA (Hons), Biology, Wilfrid Laurier University, 2005." },
];

export const PLAIN = [
  { label: "PDF", href: "/resume.pdf" }, { label: "JSON", href: "/resume.json" }, { label: "Markdown", href: "/resume.md" },
];

/** Mount the ledger. `onStep(frac)` reports the lit row as 0..1 so the molecule can turn with the scroll. */
export function mountResume(root: HTMLElement, onStep: (frac: number) => void) {
  root.innerHTML = `
    <div class="chapter-k">03 <em>Resume</em></div>
    <div class="ledger-head">
      <h2>Where I've worked</h2>
      <div class="plain">Resume ${PLAIN.map((p) => `<a class="touch" href="${p.href}" download>${p.label}</a>`).join(" · ")}</div>
    </div>
    <ol class="ledger">
      ${ENTRIES.map((e) => `<li class="ledger-row">
        <div class="ledger-y">${e.years}</div>
        <div>
          <div class="ledger-t">${e.href ? `<a class="touch" href="${e.href}" target="_blank" rel="noopener">${e.org}</a>` : e.org}<span class="ledger-r">${e.role}</span></div>
          <p class="ledger-l">${e.line}</p>
        </div>
      </li>`).join("")}
    </ol>`;
  const rows = [...root.querySelectorAll<HTMLElement>(".ledger-row")];
  const lit = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const i = rows.indexOf(en.target as HTMLElement);
      rows.forEach((r, j) => r.classList.toggle("is-lit", j === i));
      onStep(i / Math.max(1, rows.length - 1));
    }
  }, { rootMargin: "-42% 0px -42% 0px" });
  rows.forEach((r) => lit.observe(r));
}
