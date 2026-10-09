# tnfa-site

Deployed on Vercel from this repo: the Vite build is detected automatically, `api/contact.js` becomes the form's endpoint, and `vercel.json` sets long caching for the models. Environment variables are listed in `.env.example`; `VITE_SITE_URL` is needed at build time for the share image, and one of the contact options at run time for the form.

An interactive hero: the Chai-1 mouse TNF-α complex with its designed binder, drawn live in WebGL. Drag turns the complex; the pointer lights the glass and raises the binder's neon.

- `npm install`, `npm run dev` (http://localhost:5173), `npm run build` (static site in `dist/`).
- `public/models/*.glb` are the surface (one piece per chain), the target's ribbons and the binder's cartoon, Draco-compressed, exported from the CIF by `~/Downloads/tnfa-hero/export_web_meshes.py` (headless Blender with Molecular Nodes). Vertex colour is the chain colour; its alpha is the residue's pLDDT mapped to 0..1.
- `src/shaders.ts` holds the four materials: glass target with warm currents seeded by low confidence and by the pointer, inner ribbons, the fleshy neon binder with a confidence-weighted wiggle, and the nebula field. Every time term runs on a closed path in noise space, so the motion loops.
- `src/main.ts` boots the page's text first (`src/ui.ts`: Lenis, the rail, the chapters) and loads the scene (`src/scene.ts`: three.js, a drag of its own, a raycast from the pointer onto the surface, bloom, portrait docking, reduced-motion fallback) once the browser is idle.
- `npm run data` regenerates `public/resume.json` and `public/resume.md` from `src/resume.ts`.
