// GLSL for the TNFa hero: the glass target with warm currents seeded by confidence, the target's inner ribbons,
// the fleshy neon binder, and the nebula field. Vertex colour carries the chain colour; its alpha is confidence (0 unsure, 1 sure).

export const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
// a closed path through noise space: t in radians, the field repeats every 2*pi
vec3 loopOffset(float t, float r){ return vec3(cos(t)*r, 0.0, sin(t)*r); }
`;

export const SURFACE_VERT = /* glsl */ `
${NOISE}
uniform float uTime;
varying vec3 vWorld; varying vec3 vNormal; varying vec4 vColor; varying vec3 vView;
void main(){
  vColor = color;
  vec3 n = normalize(normal);
  // flow: a slow field travelling on a closed path, plus a two-breath pulse
  float flow = snoise(position * 0.9 + loopOffset(uTime * 0.25, 0.9)) * 0.08 + 0.03 * sin(uTime * 0.5);
  vec3 p = position + n * flow;
  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorld = world.xyz; vNormal = normalize(mat3(modelMatrix) * n);
  vec4 mv = viewMatrix * world; vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const SURFACE_FRAG = /* glsl */ `
${NOISE}
uniform float uTime; uniform vec3 uHit; uniform float uHitStrength; uniform float uHitRadius;
uniform vec3 uWarmA; uniform vec3 uWarmB;
varying vec3 vWorld; varying vec3 vNormal; varying vec4 vColor; varying vec3 vView;
void main(){
  vec3 N = normalize(vNormal); if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);
  float NdV = clamp(dot(N, V), 0.0, 1.0);
  float fresnel = pow(1.0 - NdV, 3.0);
  vec3 base = vColor.rgb; float conf = vColor.a;
  // the pointer's light on the surface
  float d = distance(vWorld, uHit);
  float hit = uHitStrength * exp(-(d * d) / (uHitRadius * uHitRadius));
  // warm currents: banded noise on a closed path, seeded where the model is least sure, and under the pointer
  float n = snoise(vWorld * 1.1 + loopOffset(uTime * 0.25, 0.9));
  float band = smoothstep(0.42, 0.62, n * 0.5 + 0.5);
  float seed = clamp(band * (1.0 - conf) * 0.55 + band * hit * 1.3, 0.0, 1.0);
  vec3 warm = mix(uWarmA, uWarmB, n * 0.5 + 0.5);
  // light in view space: a key from upper left, a cool fill from the right
  vec3 Nv = normalize(mat3(viewMatrix) * N);
  vec3 L1 = normalize(vec3(-0.55, 0.65, 0.75)); vec3 L2 = normalize(vec3(0.8, -0.2, 0.5));
  float diff = 0.30 + 0.55 * max(dot(Nv, L1), 0.0) + 0.25 * max(dot(Nv, L2), 0.0);
  vec3 Vv = vec3(0.0, 0.0, 1.0);
  float spec = pow(max(dot(reflect(-L1, Nv), Vv), 0.0), 60.0) * 0.6;
  vec3 col = mix(base, warm, seed) * diff + spec;
  vec3 emission = base * fresnel * 0.8 + warm * seed * 1.5 + base * hit * 0.8;
  float alpha = 0.38 + fresnel * 0.4 + seed * 0.2 + hit * 0.2;
  if (!gl_FrontFacing) alpha *= 0.55;
  gl_FragColor = vec4(col + emission, clamp(alpha, 0.0, 0.95));
}
`;

export const RIBBON_VERT = /* glsl */ `
varying vec3 vNormal; varying vec4 vColor;
void main(){
  vColor = color; vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
export const RIBBON_FRAG = /* glsl */ `
varying vec3 vNormal; varying vec4 vColor;
void main(){
  vec3 L = normalize(vec3(-0.55, 0.65, 0.75));
  float diff = 0.45 + 0.55 * max(dot(normalize(vNormal), L), 0.0);
  vec3 col = vColor.rgb * diff + vColor.rgb * 1.1;
  gl_FragColor = vec4(col, 0.9);
}
`;

export const BINDER_VERT = /* glsl */ `
${NOISE}
uniform float uTime;
varying vec3 vWorld; varying vec3 vNormal; varying vec4 vColor; varying vec3 vObj;
void main(){
  vColor = color; vObj = position;
  float unsure = 1.0 - color.a;
  // the wiggle: the less sure a residue, the more it wanders; a closed path so it loops
  vec3 w = vec3(
    snoise(position * 0.55 + loopOffset(uTime * 0.75, 0.5)),
    snoise(position * 0.55 + loopOffset(uTime * 0.75, 0.5) + 31.7),
    snoise(position * 0.55 + loopOffset(uTime * 0.75, 0.5) + 77.3));
  vec3 p = position + w * 0.09 * pow(unsure, 1.5);
  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorld = world.xyz; vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;
export const BINDER_FRAG = /* glsl */ `
${NOISE}
uniform float uTime; uniform vec3 uHit; uniform float uHitStrength; uniform float uNear;
uniform vec3 uNeonA; uniform vec3 uNeonB;
varying vec3 vWorld; varying vec3 vNormal; varying vec4 vColor; varying vec3 vObj;
void main(){
  vec3 N = normalize(vNormal); vec3 V = normalize(cameraPosition - vWorld);
  float NdV = clamp(dot(N, V), 0.0, 1.0);
  // flesh: two pinks mottled by a slow noise, faint darker veins from a finer stretched one
  float m = snoise(vObj * 6.0) * 0.5 + 0.5;
  vec3 skin = mix(vec3(0.48, 0.26, 0.33), vec3(0.80, 0.46, 0.54), smoothstep(0.35, 0.7, m));
  float veins = smoothstep(0.55, 0.75, snoise(vObj * vec3(18.0, 54.0, 18.0)) * 0.5 + 0.5);
  skin = mix(skin, skin * vec3(0.62, 0.42, 0.5), veins * 0.6);
  vec3 Nv = normalize(mat3(viewMatrix) * N);
  vec3 L1 = normalize(vec3(-0.55, 0.65, 0.75));
  float wrap = clamp((dot(Nv, L1) + 0.5) / 1.5, 0.0, 1.0);
  float back = pow(clamp(dot(-Nv, L1), 0.0, 1.0), 2.0) * 0.35;      // light through the flesh
  vec3 col = skin * (0.18 + 0.5 * wrap) + skin * back;
  // neon: a tube's hot core by facing, flickering, and brighter as the pointer comes near
  float flicker = 0.5 + 0.5 * snoise(vec3(uTime * 1.6, 0.0, 0.0));
  float strength = 1.35 + 0.35 * flicker + 0.9 * uNear;
  vec3 neon = mix(uNeonB, uNeonA, pow(1.0 - NdV, 1.6)) * strength;   // a tube: pale hot core, magenta edge
  gl_FragColor = vec4(col + neon, 1.0);
}
`;

export const NEBULA_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`;
export const NEBULA_FRAG = /* glsl */ `
${NOISE}
uniform float uTime; uniform vec2 uAspect; uniform vec2 uPointer;
varying vec2 vUv;
void main(){
  vec2 p = (vUv - 0.5) * uAspect;
  float n = snoise(vec3(p * 1.6, 0.0) + loopOffset(uTime * 0.12, 0.8)) * 0.5 + 0.5;
#ifndef LOW
  n = n * 0.6 + 0.4 * (snoise(vec3(p * 3.2, 1.7) + loopOffset(uTime * 0.12, 0.8)) * 0.5 + 0.5);
#endif
  float radial = 1.0 - smoothstep(0.0, 1.1, length(p - vec2(0.12, 0.05)));
  float glow = exp(-dot(p - uPointer, p - uPointer) * 3.0) * 0.35;   // the pointer lifts the field a little
  float f = clamp(n * 0.45 + radial * 0.45 + glow - 0.22, 0.0, 1.0);
  vec3 col = mix(vec3(0.004, 0.006, 0.02), vec3(0.016, 0.06, 0.20), f);
  gl_FragColor = vec4(col, 1.0);
}
`;
