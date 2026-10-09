// Work: papers, articles and code as rows, one search over all three. Every row links to the real thing.

type Row = { kind: "paper" | "article"; title: string; note: string; href: string; tag?: string; date: number; hay: string };

// Scholar, read 2026-10-09: https://scholar.google.com/citations?user=RYr0usAAAAAJ
export const SCHOLAR = { url: "https://scholar.google.com/citations?user=RYr0usAAAAAJ&hl=en", citations: 2779, hIndex: 20, papers: 20, read: "2026-10-09" };

const PAPERS = [
  { title: "Dyno Psi-1: a generative model for protein folding and binding", venue: "Dyno Therapeutics white paper", year: 2025, cites: null, first: false, tag: "engineering", href: "https://dynopsi.dynotx.com" },
  { title: "Discovery of lignin-transforming bacteria and enzymes in thermophilic environments using stable isotope probing", venue: "The ISME Journal", year: 2022, cites: 65, first: true, href: "https://doi.org/10.1038/s41396-022-01241-8" },
  { title: "Bacterial catabolism of acetovanillone, a lignin-derived compound", venue: "PNAS", year: 2022, cites: 21, first: false, href: "https://doi.org/10.1073/pnas.2213450119" },
  { title: "Genomics and metatranscriptomics of biogeochemical cycling and degradation of lignin-derived aromatic compounds in thermal swamp sediment", venue: "The ISME Journal", year: 2021, cites: 85, first: true, href: "https://doi.org/10.1038/s41396-020-00820-x" },
  { title: "Characterization of alkylguaiacol-degrading cytochromes P450 for the biocatalytic valorization of lignin", venue: "PNAS", year: 2020, cites: 68, first: true, tag: "co-first", href: "https://doi.org/10.1073/pnas.1916349117" },
  { title: "Catabolism of alkylphenols in Rhodococcus via a meta-cleavage pathway associated with genomic islands", venue: "Frontiers in Microbiology", year: 2019, cites: 33, first: true, href: "https://doi.org/10.3389/fmicb.2019.01862" },
  { title: "Seasonal and ecohydrological regulation of active microbial populations involved in DOC, CO2, and CH4 fluxes in temperate rainforest soil", venue: "The ISME Journal", year: 2019, cites: 59, first: true, href: "https://doi.org/10.1038/s41396-018-0334-3" },
  { title: "Microbial functional genes involved in nitrogen fixation, nitrification and denitrification in forest ecosystems", venue: "Soil Biology and Biochemistry", year: 2014, cites: 918, first: true, href: "https://doi.org/10.1016/j.soilbio.2014.03.021" },
  { title: "Quantification of nitrogen reductase and nitrite reductase genes in soil of thinned and clear-cut Douglas-fir stands by using real-time PCR", venue: "Applied and Environmental Microbiology", year: 2010, cites: 94, first: true, href: "https://doi.org/10.1128/aem.02188-09" },
  { title: "Cycling of extracellular DNA in the soil environment", venue: "Soil Biology and Biochemistry", year: 2007, cites: 674, first: true, href: "https://doi.org/10.1016/j.soilbio.2007.06.020" },
];

const ARTICLES = [
  { title: "We put Anthropic's Claude-optimized protein models on our production cluster overnight", where: "Substack", date: "2026-09-21", href: "https://davidlevybooth.substack.com/p/we-put-anthropics-claude-optimized" },
  { title: "Dyno Psi-Phi: shaping new futures for protein design", where: "Dyno Therapeutics", date: "2026-03-18", href: "https://dynotx.substack.com/p/dyno-psi-phi-shaping-new-futures" },
  { title: "Can AI agents solve the last-mile problem in generative therapeutic design?", where: "Dyno Therapeutics", date: "2025-11-11", href: "https://dynotx.substack.com/p/can-ai-agents-solve-the-last-mile" },
  { title: "Exploring AI agents for task orchestration", where: "LinkedIn", date: "2025-09-22", href: "https://www.linkedin.com/pulse/exploring-ai-agents-task-orchestration-david-levy-booth-4n5yc/" },
  { title: "How a bacteriological tour of northern British Columbia uncovered thermostable ligninases", where: "Nature Portfolio Communities", date: "2022-06-01", href: "https://communities.springernature.com/posts/how-a-bacteriological-tour-of-northern-british-columbia-uncovered-thermostable-ligninases" },
];
export const SUBSTACK = "https://substack.com/@davidlevybooth";


// the selected pieces, each with a picture of its own: a figure or header image the piece itself carries, or a word
type Pick = { kind: "paper" | "article"; title: string; note: string; href: string; img?: string; word?: string; line: string; tag?: string };
export const SELECTED: Pick[] = [
  { kind: "article", title: "We put Anthropic's Claude-optimized protein models on our production cluster overnight", note: "Substack · 2026", href: "https://davidlevybooth.substack.com/p/we-put-anthropics-claude-optimized", img: "/work/claude.webp",
    line: "Real speedups, but in production the batch shape mattered more than the kernels." },
  { kind: "paper", title: "Discovery of lignin-transforming bacteria and enzymes in thermophilic environments using stable isotope probing", note: "The ISME Journal · 2022", href: "https://doi.org/10.1038/s41396-022-01241-8", img: "/work/bog.webp", tag: "first author",
    line: "Hot springs in northern British Columbia, labelled lignin, and the bacteria that ate it." },
  { kind: "paper", title: "Genomics and metatranscriptomics of biogeochemical cycling and degradation of lignin-derived aromatic compounds in thermal swamp sediment", note: "The ISME Journal · 2021", href: "https://doi.org/10.1038/s41396-020-00820-x", img: "/work/phylo.webp", tag: "first author",
    line: "Who lives in a thermal swamp, and which of them are working." },
  { kind: "paper", title: "Characterization of alkylguaiacol-degrading cytochromes P450 for the biocatalytic valorization of lignin", note: "PNAS · 2020", href: "https://doi.org/10.1073/pnas.1916349117", img: "/work/gcob.webp", tag: "co-first",
    line: "Enzymes that open lignin's rings, characterised and put to work. Pictured: GcoB, the reductase partner from a related system, PDB 5OGX." },
  { kind: "paper", title: "Catabolism of alkylphenols in Rhodococcus via a meta-cleavage pathway associated with genomic islands", note: "Frontiers in Microbiology · 2019", href: "https://doi.org/10.3389/fmicb.2019.01862", img: "/work/lignin.webp", tag: "first author",
    line: "A soil bacterium's route through lignin-derived phenols, traced to mobile islands in its genome." },
  { kind: "paper", title: "Microbial functional genes involved in nitrogen fixation, nitrification and denitrification in forest ecosystems", note: "Soil Biology and Biochemistry · 2014", href: "https://doi.org/10.1016/j.soilbio.2014.03.021", img: "/work/field.webp", tag: "first author",
    line: "The nitrogen cycle, gene by gene. Cited 918 times." },
  { kind: "article", title: "Can AI agents solve the last-mile problem in generative therapeutic design?", note: "Dyno Therapeutics · 2025", href: "https://dynotx.substack.com/p/can-ai-agents-solve-the-last-mile", img: "/work/agents.webp",
    line: "Why the final stretch of therapeutic design needs agents that know the science, not bigger general models." },
];

const fmt = (d: string) => d.slice(0, 4);
function rows(): Row[] {
  const papers: Row[] = PAPERS.map((p) => ({ kind: "paper", title: p.title, href: p.href, date: p.year,
    note: `${p.venue} · ${p.year}${p.cites ? ` · ${p.cites} citations` : ""}`, tag: p.tag ?? (p.first ? "first author" : undefined),
    hay: `${p.title} ${p.venue} ${p.year}`.toLowerCase() }));
  const articles: Row[] = ARTICLES.map((a) => ({ kind: "article", title: a.title, href: a.href, date: Number(fmt(a.date)), note: `${a.where} · ${fmt(a.date)}`, hay: `${a.title} ${a.where}`.toLowerCase() }));
  return [...papers, ...articles];
}

const GROUPS: { kind: Row["kind"]; title: string; more: { label: string; href: string } }[] = [
  { kind: "paper", title: "Papers", more: { label: `all ${SCHOLAR.papers} on Scholar · ${SCHOLAR.citations.toLocaleString()} citations · h ${SCHOLAR.hIndex}`, href: SCHOLAR.url } },
  { kind: "article", title: "Articles", more: { label: "Substack", href: SUBSTACK } },
];

export function mountWork(root: HTMLElement) {
  const all = rows();
  root.innerHTML = `
    <div class="chapter-k">02 <em>Work</em></div>
    <div class="work-head"><h2>My writing</h2>
      <div class="gal-nav">
        <button class="gal-btn touch" type="button" data-dir="-1" aria-label="Previous"><i></i><i></i><i></i><i></i><i></i></button>
        <div class="gal-count"><span class="gal-i">01</span> / ${String(SELECTED.length).padStart(2, "0")}</div>
        <button class="gal-btn touch" type="button" data-dir="1" aria-label="Next"><i></i><i></i><i></i><i></i><i></i></button>
      </div></div>
    <div class="gal touch">
      ${SELECTED.map((p, i) => `<a class="card" href="${p.href}" target="_blank" rel="noopener" data-i="${i}">
        <div class="card-img">${p.img ? `<img src="${p.img}" alt="" loading="lazy" draggable="false" />` : `<div class="card-word">${p.word}</div>`}</div>
        <div class="card-k">${p.note}${p.tag ? `<em>${p.tag}</em>` : ""}</div>
        <div class="card-t">${p.title}</div>
        <div class="card-l">${p.line}</div>
      </a>`).join("")}
      <div class="gal-end"></div>
    </div>
    <div class="work-head work-all">
      <h3 class="all-k">Everything</h3>
      <label class="search touch"><span class="sr">Search</span><input type="search" placeholder="Search papers and articles" autocomplete="off" spellcheck="false" /></label>
    </div>
    <div class="lists"></div>`;
  // the gallery: snap scrolling, drag, the counter, the rest dimmed
  const gal = root.querySelector<HTMLElement>(".gal")!; const cards = [...gal.querySelectorAll<HTMLElement>(".card")]; const counter = root.querySelector<HTMLElement>(".gal-i")!;
  // the current card is the one whose left edge is nearest the gallery's inset
  let raf = 0;
  const current = () => { raf = 0; const x = gal.scrollLeft + gal.getBoundingClientRect().left + 8; let best = 0, bd = 1e9;
    cards.forEach((c, j) => { const d = Math.abs(c.getBoundingClientRect().left + gal.scrollLeft - x); if (d < bd) { bd = d; best = j; } });
    counter.textContent = String(best + 1).padStart(2, "0"); cards.forEach((c, j) => c.classList.toggle("is-on", j === best)); };
  gal.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(current); }); current();
  // snapping happens here, not in CSS: CSS snap undoes each small trackpad step. Once scrolling goes idle, settle on the nearest card.
  let settle = 0; let dragging = false;
  const nearest = () => { const x = gal.scrollLeft; let best = cards[0], bd = 1e9; for (const c of cards) { const d = Math.abs(c.offsetLeft - gal.offsetLeft - x); if (d < bd) { bd = d; best = c; } } return best; };
  const queueSettle = () => { clearTimeout(settle); settle = window.setTimeout(() => { if (dragging) return; const to = nearest(); const left = to.offsetLeft - gal.offsetLeft; if (Math.abs(left - gal.scrollLeft) > 2) gal.scrollTo({ left, behavior: "smooth" }); }, 160); };
  gal.addEventListener("scroll", queueSettle, { passive: true });
  // drag to scroll, without pointer capture: capture would retarget the click to the gallery and the link would never open
  let drag: { x: number; left: number; moved: boolean } | null = null;
  gal.addEventListener("pointerdown", (e) => { if (e.button !== 0 || e.pointerType === "touch") return; drag = { x: e.clientX, left: gal.scrollLeft, moved: false }; dragging = true; });
  window.addEventListener("pointermove", (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 6 && !drag.moved) { drag.moved = true; gal.classList.add("is-drag"); } if (drag.moved) gal.scrollLeft = drag.left - dx; });
  const end = () => { if (!drag) return; const moved = drag.moved; drag = null; dragging = false; gal.classList.remove("is-drag"); if (moved) { gal.dataset.swallow = "1"; setTimeout(() => delete gal.dataset.swallow, 0); } queueSettle(); };
  window.addEventListener("pointerup", end); window.addEventListener("pointercancel", end);
  gal.addEventListener("click", (e) => { if (gal.dataset.swallow) { e.preventDefault(); e.stopPropagation(); } }, true);
  // sideways wheel or trackpad motion moves the gallery (shift turns a wheel sideways); vertical motion is the page's, never trapped here
  gal.addEventListener("wheel", (e) => {
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    if (dx) { gal.scrollLeft += dx; e.preventDefault(); e.stopPropagation(); }
  }, { passive: false });
  // step by card: the arrows beside the counter, and the keyboard once the gallery has focus
  const step = (dir: number) => { const i = cards.findIndex((c) => c.classList.contains("is-on")); const to = cards[Math.max(0, Math.min(cards.length - 1, i + dir))]; gal.scrollTo({ left: to.offsetLeft - gal.offsetLeft, behavior: "smooth" }); };
  root.querySelectorAll<HTMLButtonElement>(".gal-btn").forEach((b) => b.addEventListener("click", () => step(Number(b.dataset.dir))));
  gal.tabIndex = 0;
  gal.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { step(1); e.preventDefault(); } if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); } });
  const lists = root.querySelector<HTMLElement>(".lists")!;
  const input = root.querySelector<HTMLInputElement>("input")!;
  function render(q: string) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    lists.innerHTML = GROUPS.map((g) => {
      const items = all.filter((r) => r.kind === g.kind && words.every((w) => r.hay.includes(w)));
      if (!items.length) return "";
      return `<div class="list"><div class="list-head"><h3>${g.title}</h3><a class="touch" href="${g.more.href}" target="_blank" rel="noopener">${g.more.label}</a></div>
        ${items.map((r) => `<a class="row touch" href="${r.href}" target="_blank" rel="noopener">
          <span class="row-t">${r.title}${r.tag ? `<em>${r.tag}</em>` : ""}</span><span class="row-n">${r.note}</span></a>`).join("")}</div>`;
    }).join("") || `<div class="list-empty">Nothing matches.</div>`;
  }
  input.addEventListener("input", () => render(input.value));
  render("");
}
