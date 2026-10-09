// The TNFa complex, drawn live: three meshes from the Chai-1 model. Drag turns it, the pointer lights it, the chapters dock it.
// Loaded after the page's text so the first paint never waits for three.js or the models.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SURFACE_VERT, SURFACE_FRAG, RIBBON_VERT, RIBBON_FRAG, BINDER_VERT, BINDER_FRAG, NEBULA_VERT, NEBULA_FRAG } from "./shaders";
import type { UIState } from "./ui";

// where the molecule sits in each chapter: x, y in world units, and scale; a second set for portrait screens
type Dock = { x: number; y: number; s: number };
const DOCK_WIDE: Record<string, Dock> = { hero: { x: 0, y: 0, s: 1 }, about: { x: 3.0, y: 0.3, s: 0.62 }, band: { x: 6, y: -2.6, s: 0 }, work: { x: 6, y: -2.6, s: 0 }, resume: { x: 5.5, y: -2.9, s: 0.36 }, close: { x: 3.6, y: 0.1, s: 0.72 } };
const DOCK_TALL: Record<string, Dock> = { hero: { x: 0.5, y: 0.6, s: 1 }, about: { x: 0, y: 3.6, s: 0.5 }, band: { x: 0, y: 6, s: 0 }, work: { x: 0, y: 6, s: 0 }, resume: { x: 0, y: 6, s: 0 }, close: { x: 0, y: 3.4, s: 0.55 } };

export function initScene(ui: UIState) {
  const canvas = document.getElementById("stage") as HTMLCanvasElement;
  const lowPower = ui.touch || innerWidth < 760;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

  const lin = (hex: string) => new THREE.Color(hex).convertSRGBToLinear();
  const shared = { uTime: { value: 0 }, uHit: { value: new THREE.Vector3(1e3, 1e3, 1e3) }, uHitStrength: { value: 0 }, uHitRadius: { value: 1.6 }, uNear: { value: 0 } };

  const nebulaMat = new THREE.ShaderMaterial({
    vertexShader: NEBULA_VERT, fragmentShader: NEBULA_FRAG,
    uniforms: { uTime: shared.uTime, uAspect: { value: new THREE.Vector2(1, 1) }, uPointer: { value: new THREE.Vector2(9, 9) } },
    defines: lowPower ? { LOW: 1 } : {}, depthTest: false, depthWrite: false,
  });
  const nebula = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), nebulaMat); nebula.frustumCulled = false; nebula.renderOrder = -10; scene.add(nebula);

  const group = new THREE.Group(); scene.add(group);
  const surfaceUniforms = { ...shared, uWarmA: { value: lin("#F07FB0") }, uWarmB: { value: lin("#FF8A3D") } };
  const surfaceBack = new THREE.ShaderMaterial({ vertexShader: SURFACE_VERT, fragmentShader: SURFACE_FRAG, uniforms: surfaceUniforms, vertexColors: true, transparent: true, depthWrite: false, side: THREE.BackSide });
  const surfaceFront = new THREE.ShaderMaterial({ vertexShader: SURFACE_VERT, fragmentShader: SURFACE_FRAG, uniforms: surfaceUniforms, vertexColors: true, transparent: true, depthWrite: false, side: THREE.FrontSide });
  const ribbonMat = new THREE.ShaderMaterial({ vertexShader: RIBBON_VERT, fragmentShader: RIBBON_FRAG, vertexColors: true, transparent: true, depthWrite: true });
  const binderMat = new THREE.ShaderMaterial({ vertexShader: BINDER_VERT, fragmentShader: BINDER_FRAG, vertexColors: true, uniforms: { ...shared, uNeonA: { value: lin("#FF3D9A") }, uNeonB: { value: lin("#FFC6E6") } } });

  const loader = new GLTFLoader(); const draco = new DRACOLoader(); draco.setDecoderPath("/draco/"); loader.setDRACOLoader(draco);
  const load = (url: string) => new Promise<THREE.BufferGeometry>((res, rej) => loader.load(url, (g) => res((g.scene.getObjectByProperty("type", "Mesh") as THREE.Mesh).geometry), undefined, (e) => { (window as any).__tnfaError = String(e); rej(e); }));
  let surfaceMesh: THREE.Mesh | null = null; let binder: THREE.Mesh | null = null;
  Promise.all([load("/models/surface.glb"), load("/models/ribbons.glb"), load("/models/binder.glb")]).then(([s, r, b]) => {
    s.computeBoundingBox(); const c = new THREE.Vector3(); s.boundingBox!.getCenter(c);
    for (const g of [s, r, b]) g.translate(-c.x, -c.y, -c.z);
    const ribbons = new THREE.Mesh(r, ribbonMat); ribbons.renderOrder = 1;
    const front = new THREE.Mesh(s, surfaceFront); front.renderOrder = 3;
    binder = new THREE.Mesh(b, binderMat); binder.renderOrder = 4; b.computeBoundingSphere();
    group.add(ribbons);
    if (!lowPower) { const back = new THREE.Mesh(s, surfaceBack); back.renderOrder = 2; group.add(back); }   // the far side of the glass is the costliest pass; phones skip it
    group.add(front, binder);
    surfaceMesh = front; group.rotation.set(0.15, -0.6, 0);
    s.computeBoundingSphere(); (window as any).__tnfa = { loaded: true, radius: s.boundingSphere!.radius, count: group.children.length, verts: s.attributes.position.count, colorSize: s.attributes.color?.itemSize, lowPower };
    canvas.classList.add("is-live");
  });

  // the pointer: its ray on the surface lights the glass; near the binder, the neon rises. A finger does the same while it moves.
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(9, 9); let pointerIn = false;
  const hitTarget = new THREE.Vector3(); let hitStrengthTarget = 0; let nearTarget = 0; const centre = new THREE.Vector3(); const ptr2 = new THREE.Vector2();
  canvas.addEventListener("pointermove", (e) => { pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); pointerIn = true; });
  canvas.addEventListener("pointerleave", () => { pointerIn = false; });
  canvas.addEventListener("pointerup", () => { if (ui.touch) pointerIn = false; });

  // drag turns the complex on the hero: a small orbit of our own, so touch scrolling stays the browser's
  let drag: { x: number; y: number; rx: number; ry: number } | null = null; let dragRot = { x: 0, y: 0 }; let spin = 0;
  canvas.addEventListener("pointerdown", (e) => { if (ui.touch || scrollP > 0.2) return; drag = { x: e.clientX, y: e.clientY, rx: dragRot.x, ry: dragRot.y }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => { if (!drag) return; dragRot = { y: drag.ry + (e.clientX - drag.x) * 0.006, x: THREE.MathUtils.clamp(drag.rx + (e.clientY - drag.y) * 0.004, -0.8, 0.8) }; });
  const endDrag = () => { drag = null; }; canvas.addEventListener("pointerup", endDrag); canvas.addEventListener("pointercancel", endDrag);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / (lowPower ? 4 : 2), innerHeight / (lowPower ? 4 : 2)), 0.5, 0.45, 0.88);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  let tall = false;
  function resize() {
    const w = innerWidth, h = innerHeight; tall = w / h < 1.05;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    // on a portrait screen the complex must fit the width, so the camera backs off as the frame narrows
    camera.position.set(0, 1.2, 16.5 * Math.max(1, 1.25 / camera.aspect));
    camera.lookAt(0, 0.4, 0);
    composer.setSize(w, h); nebulaMat.uniforms.uAspect.value.set(w / h, 1);
  }
  addEventListener("resize", resize); resize();

  const ease = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  let scrollP = 0; let turnS = 1; const dock = { x: 0, y: 0, s: 1 }; const t0 = performance.now(); let skip = false;
  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const DOCK = tall ? DOCK_TALL : DOCK_WIDE;
    const p = ease(THREE.MathUtils.clamp(ui.scroll() / innerHeight, 0, 1)); scrollP += (p - scrollP) * 0.1;
    const aspectK = Math.min(1, camera.aspect / 1.6);
    const target = ui.chapter === "hero" || ui.chapter === "about"
      ? { x: DOCK.hero.x + (DOCK.about.x - DOCK.hero.x) * scrollP, y: DOCK.hero.y + (DOCK.about.y - DOCK.hero.y) * scrollP, s: 1 - (1 - DOCK.about.s) * scrollP }
      : DOCK[ui.chapter] ?? DOCK.about;
    dock.x += (target.x - dock.x) * 0.07; dock.y += (target.y - dock.y) * 0.07; dock.s += (target.s - dock.s) * 0.07;
    group.position.set(dock.x * (tall ? 1 : aspectK), dock.y, 0); group.scale.setScalar(Math.max(dock.s, 0.001)); group.visible = dock.s > 0.02;
    turnS += (ui.resumeTurn - turnS) * 0.05;
    if (!ui.reduced && !drag) spin += 0.0012;
    group.rotation.y = -0.6 - 0.55 * scrollP + (turnS - 1) * 1.6 + dragRot.y + spin; group.rotation.x = 0.15 + dragRot.x;
    shared.uTime.value = ui.reduced ? 0 : (performance.now() - t0) / 1000;
    if (surfaceMesh && binder) {
      if (pointerIn && group.visible) {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(surfaceMesh, false);
        if (hits.length) { hitTarget.copy(hits[0].point); hitStrengthTarget = 1; } else hitStrengthTarget = 0;
        const sph = binder.geometry.boundingSphere!; centre.copy(sph.center).applyMatrix4(binder.matrixWorld);
        const d = raycaster.ray.distanceToPoint(centre); const rad = sph.radius * dock.s;
        nearTarget = THREE.MathUtils.clamp(1 - (d - rad * 0.6) / (rad * 1.6), 0, 1);
      } else { hitStrengthTarget = 0; nearTarget = 0; }
      shared.uHit.value.lerp(hitTarget, 0.12);
      shared.uHitStrength.value += (hitStrengthTarget - shared.uHitStrength.value) * 0.08;
      shared.uNear.value += (nearTarget - shared.uNear.value) * 0.08;
      nebulaMat.uniforms.uPointer.value.lerp(ptr2.set(pointer.x * 0.5 * camera.aspect, pointer.y * 0.5), 0.08);
    }
    // while the molecule is away only the field is drawn, without bloom and at half rate on phones
    if (!group.visible) { skip = !skip; if (lowPower && skip) return; renderer.render(scene, camera); return; }
    composer.render();
  }
  frame();
}
