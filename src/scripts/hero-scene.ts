/**
 * hero-scene.ts
 * Three.js floating particle-network scene rendered into #hero-canvas.
 * Particles are small icosahedrons linked by thin lines when close enough.
 * Colour palette: mint-green (#0FF378) matching the site's design system.
 * Auto-pauses via IntersectionObserver when the hero section leaves viewport.
 * Gracefully no-ops if WebGL is unavailable or canvas is missing.
 */

import * as THREE from 'three';

/* ─── constants ────────────────────────────────────────────────────────────── */

const PARTICLE_COUNT = 42;
const LINK_DISTANCE  = 180;   // world units — max edge length
const PARTICLE_SPEED = 0.18;  // world units/s
const MOUSE_STRENGTH = 2.4;   // parallax camera offset strength
const CANVAS_ID      = 'hero-canvas';
const GREEN          = new THREE.Color('#0FF378');
const GREEN_DIM      = new THREE.Color('#08C25F');

/* ─── types ──────────────────────────────────────────────────────────────── */

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
}

/* ─── main ───────────────────────────────────────────────────────────────── */

export function initHeroScene(): void {
  const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
  if (!canvas) return;

  /* Bail out for reduced-motion users before touching WebGL */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* WebGL support check */
  if (!window.WebGLRenderingContext) return;

  /* Renderer ---------------------------------------------------------------- */
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  } catch {
    return; // WebGL context creation failed
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0); // fully transparent

  /* Scene + camera ---------------------------------------------------------- */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
  camera.position.z = 600;

  /* Geometries --------------------------------------------------------------- */
  const icoGeo   = new THREE.IcosahedronGeometry(5, 0);
  const matSolid = new THREE.MeshBasicMaterial({
    color: GREEN_DIM,
    transparent: true,
    opacity: 0.55,
  });

  /* Particles ---------------------------------------------------------------- */
  const particles: Particle[] = [];
  const bounds = 380;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const mesh = new THREE.Mesh(icoGeo, matSolid.clone());
    mesh.position.set(
      rnd(-bounds, bounds),
      rnd(-bounds, bounds),
      rnd(-120, 120),
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.scale.setScalar(rnd(0.6, 1.6));
    scene.add(mesh);

    particles.push({
      mesh,
      vel: new THREE.Vector3(rnd(-PARTICLE_SPEED, PARTICLE_SPEED), rnd(-PARTICLE_SPEED, PARTICLE_SPEED), 0),
    });
  }

  /* Edge lines --------------------------------------------------------------- */
  const maxEdges  = PARTICLE_COUNT * (PARTICLE_COUNT - 1) / 2;
  const positions = new Float32Array(maxEdges * 2 * 3);
  const lineGeo   = new THREE.BufferGeometry();
  const posAttr   = new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage);
  lineGeo.setAttribute('position', posAttr);

  const lines = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.18 }),
  );
  scene.add(lines);

  /* Mouse parallax ---------------------------------------------------------- */
  const mouse  = new THREE.Vector2(0, 0);
  const camTarget = new THREE.Vector2(0, 0);

  const onMouseMove = (e: MouseEvent) => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  /* Resize ------------------------------------------------------------------- */
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;            // skip degenerate size
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(canvas);
  resize();

  /* Clock -------------------------------------------------------------------- */
  const clock = new THREE.Clock(true); // auto-start

  /* Animation loop ---------------------------------------------------------- */
  let animId: number | null = null;
  let loopActive = false;             // guards against duplicate RAF loops

  const tick = () => {
    if (!loopActive) return;
    animId = requestAnimationFrame(tick);

    const delta = Math.min(clock.getDelta(), 0.05);

    // Smooth camera parallax
    camTarget.lerp(mouse, 0.06);
    camera.position.x = camTarget.x * MOUSE_STRENGTH * 10;
    camera.position.y = camTarget.y * MOUSE_STRENGTH * 10;

    // Move particles + wrap
    for (const p of particles) {
      p.mesh.position.addScaledVector(p.vel, delta * 60);
      p.mesh.rotation.y += delta * 0.3;
      const pos = p.mesh.position;
      if (pos.x >  bounds) pos.x = -bounds;
      if (pos.x < -bounds) pos.x =  bounds;
      if (pos.y >  bounds) pos.y = -bounds;
      if (pos.y < -bounds) pos.y =  bounds;
    }

    // Rebuild edges
    let idx = 0;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        if (particles[i].mesh.position.distanceTo(particles[j].mesh.position) < LINK_DISTANCE) {
          const a = particles[i].mesh.position;
          const b = particles[j].mesh.position;
          positions[idx++] = a.x; positions[idx++] = a.y; positions[idx++] = a.z;
          positions[idx++] = b.x; positions[idx++] = b.y; positions[idx++] = b.z;
        }
      }
    }
    posAttr.needsUpdate = true;
    lineGeo.setDrawRange(0, idx / 3);

    renderer.render(scene, camera);
  };

  const startLoop = () => {
    if (loopActive) return;     // already running — no duplicate loops
    loopActive = true;
    clock.start();
    tick();
  };

  const stopLoop = () => {
    loopActive = false;
    if (animId !== null) { cancelAnimationFrame(animId); animId = null; }
  };

  /* IntersectionObserver — pause when hero scrolls out of view -------------- */
  const heroSection = document.getElementById('home');

  // Start immediately in all cases, IO will stop it when scrolled away
  startLoop();

  if (heroSection) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0 },
    );
    io.observe(heroSection);

    /* Cleanup on page hide */
    window.addEventListener('pagehide', () => {
      stopLoop();
      io.disconnect();
      resizeObs.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
    }, { once: true });
  }
}

/* ─── utility ────────────────────────────────────────────────────────────── */
function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
