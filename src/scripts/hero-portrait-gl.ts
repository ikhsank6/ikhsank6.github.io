import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * WebGL layer for the hero portrait.
 *
 * The portrait is the hero's subject, so the effect lives *on* it rather than
 * behind it as an ambient backdrop — a pointer-driven ripple with a chromatic
 * split that intensifies with cursor speed, plus two GSAP-driven uniforms: a
 * reveal wipe on entrance and a dispersion that builds as the hero scrolls
 * away.
 *
 * Raw WebGL, not Three.js: this is one textured quad, and Three would cost
 * ~150KB gzip for it. The whole module is a couple of KB.
 *
 * The <img> stays in the DOM and is only hidden once the first frame is drawn,
 * so no-WebGL, reduced-motion and slow-texture cases all keep a real portrait.
 * The CSS edge masks are re-implemented in the shader — otherwise the pas
 * foto's three hard crop edges would come back.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;

uniform sampler2D uTex;
uniform vec2  uPointer;    // 0..1 within the portrait box
uniform float uPresence;   // 0..1 — how close the cursor is
uniform float uTime;
uniform float uReveal;     // 0..1 entrance wipe
uniform float uDisperse;   // 0..1 scroll-away dispersion
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // Pointer ripple: a decaying wave centred on the cursor.
  float d = distance(uv, uPointer);
  float ripple = sin(d * 22.0 - uTime * 2.4) * exp(-d * 5.0) * 0.010 * uPresence;

  // Idle drift so the surface is never completely dead.
  float idle = sin(uv.y * 5.0 + uTime * 0.5) * 0.0016;

  vec2 offset = vec2(ripple + idle, ripple * 0.55);
  offset *= 1.0 + uDisperse * 7.0;

  // Chromatic split — subtle at rest, pronounced under the cursor and as the
  // hero disperses on scroll.
  float split = 0.0016 * uPresence + uDisperse * 0.014;

  vec4 base = texture2D(uTex, uv + offset);
  float r = texture2D(uTex, uv + offset + vec2(split, 0.0)).r;
  float b = texture2D(uTex, uv + offset - vec2(split, 0.0)).b;
  vec3 rgb = vec3(r, base.g, b);

  // One factor applied to colour *and* alpha together. The texture is uploaded
  // premultiplied and we blend with (ONE, ONE_MINUS_SRC_ALPHA), so fading alpha
  // alone would leave the colour over-bright and the figure would wash out.
  float m = 1.0;

  // Re-create the CSS masks in shader space: the source is cropped mid-torso
  // and through both shoulders, so all three cuts need dissolving.
  m *= 1.0 - smoothstep(0.74, 0.99, uv.y);
  m *= smoothstep(0.0, 0.07, uv.x) * (1.0 - smoothstep(0.93, 1.0, uv.x));

  // Reveal sweeps a soft edge upward: at uReveal 0 nothing shows, at 1 the
  // band has travelled clear past the top and the whole figure is solid.
  float p = 1.0 - uv.y;
  m *= 1.0 - smoothstep(uReveal * 1.25 - 0.2, uReveal * 1.25, p);

  m *= 1.0 - uDisperse * 0.55;

  gl_FragColor = vec4(rgb * m, base.a * m);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function initHeroPortraitGL(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const host = document.getElementById('heroPortrait');
  const img = host?.querySelector('img');
  if (!host || !img) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-portrait-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const gl =
    (canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true }) as
      | WebGLRenderingContext
      | null) ?? null;
  if (!gl) return; // keep the <img>

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  if (!program) return;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  // Full-viewport triangle pair.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {
    tex: gl.getUniformLocation(program, 'uTex'),
    pointer: gl.getUniformLocation(program, 'uPointer'),
    presence: gl.getUniformLocation(program, 'uPresence'),
    time: gl.getUniformLocation(program, 'uTime'),
    reveal: gl.getUniformLocation(program, 'uReveal'),
    disperse: gl.getUniformLocation(program, 'uDisperse'),
  };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(u.tex, 0);

  // Animated state. GSAP owns reveal/disperse; the pointer is eased by hand
  // because it updates every frame from raw events.
  // reveal starts solid: the GSAP hero timeline has already played the
  // portrait's entrance on the host element by the time this idle-loaded
  // module takes over, and wiping again would read as the portrait vanishing
  // and coming back.
  const state = { reveal: 1, disperse: 0, presence: 0 };
  const pointer = { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42, tPresence: 0 };

  let running = false;
  let ready = false;
  let raf = 0;
  const start = performance.now();

  function resize(): void {
    const rect = host!.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl!.viewport(0, 0, w, h);
  }

  function frame(): void {
    if (!running) return;
    raf = requestAnimationFrame(frame);

    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;
    state.presence += (pointer.tPresence - state.presence) * 0.06;

    gl!.uniform2f(u.pointer, pointer.x, pointer.y);
    gl!.uniform1f(u.presence, state.presence);
    gl!.uniform1f(u.time, (performance.now() - start) / 1000);
    gl!.uniform1f(u.reveal, state.reveal);
    gl!.uniform1f(u.disperse, state.disperse);

    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }

  function play(): void {
    if (running || !ready) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function pause(): void {
    running = false;
    cancelAnimationFrame(raf);
  }

  const texImage = new Image();
  texImage.crossOrigin = 'anonymous';
  texImage.decoding = 'async';
  texImage.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImage);

    host.appendChild(canvas);
    resize();
    ready = true;
    play();

    // Only now is the canvas guaranteed to paint a portrait — swap.
    host.classList.add('is-gl');

    // Dispersion builds as the hero leaves, so the portrait comes apart into
    // the section transition instead of just sliding away.
    gsap.to(state, {
      disperse: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#home',
        start: 'center top',
        end: 'bottom top',
        scrub: true,
      },
    });
    ScrollTrigger.refresh();
  };
  texImage.src = img.currentSrc || img.src;

  const onPointerMove = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    pointer.tx = x;
    pointer.ty = y;
    // Presence falls off outside the box so the ripple fades rather than
    // snapping off at the edge.
    const outside = Math.max(0, Math.abs(x - 0.5) - 0.5, Math.abs(y - 0.5) - 0.5);
    pointer.tPresence = Math.max(0, 1 - outside * 4);
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Don't burn frames when the hero is off screen.
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? play() : pause()),
    { threshold: 0 }
  );
  io.observe(host);

  const ro = new ResizeObserver(() => resize());
  ro.observe(host);
}
