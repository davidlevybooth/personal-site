// Boot: the page's text first, then the molecule in its own chunk once the browser is idle.
import { initUI } from "./ui";

const ui = initUI();
const start = () => import("./scene").then((m) => m.initScene(ui));
if ("requestIdleCallback" in window) (window as any).requestIdleCallback(start, { timeout: 800 }); else setTimeout(start, 50);
