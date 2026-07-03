import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Central animation entry point. All motion is registered inside
 * gsap.matchMedia() contexts so it automatically respects
 * prefers-reduced-motion and pointer capabilities.
 *
 * Initial hidden states live in CSS under the `.js` scope (see global.css),
 * so no-JS visitors and reduced-motion users always see full content.
 */
export function initAnimations(): void {
  const mm = gsap.matchMedia();

  mm.add(
    {
      motionOK: '(prefers-reduced-motion: no-preference)',
      pointerFine: '(hover: hover) and (pointer: fine)',
    },
    (context) => {
      const { motionOK, pointerFine } = context.conditions as {
        motionOK: boolean;
        pointerFine: boolean;
      };

      if (!motionOK) return;

      const cleanups: Array<() => void> = [];

      runHeroTimeline();
      setupScrollReveals();
      floatOrbs();
      spinCube();

      if (pointerFine) {
        cleanups.push(setupMouseParallax());
        cleanups.push(setupTilt());
        cleanups.push(setupMagneticButtons());
      }

      // Re-measure once everything (fonts, images, hydrated islands) settled.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      cleanups.push(() => window.removeEventListener('load', refresh));

      return () => cleanups.forEach((cleanup) => cleanup());
    }
  );
}

/* ---------------------------------- hero --------------------------------- */

function runHeroTimeline(): void {
  const letters = gsap.utils.toArray<HTMLElement>('.name-letter');

  gsap.set('[data-hero]', { y: 28 });
  gsap.set('[data-hero="divider"]', { y: 0, scaleX: 0, transformOrigin: 'left center' });
  gsap.set(letters, {
    yPercent: 70,
    rotationX: -90,
    transformPerspective: 600,
    transformOrigin: '50% 100% -30px',
  });

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Keep the total intro tight — the description block is the LCP element,
  // so it must paint well under ~1s after first render.
  timeline
    .to('[data-hero="eyebrow"]', { opacity: 1, y: 0, duration: 0.5 })
    .to(
      letters,
      { opacity: 1, yPercent: 0, rotationX: 0, duration: 0.8, stagger: 0.03, ease: 'back.out(1.5)' },
      '-=0.35'
    )
    .to('[data-hero="stats"]', { opacity: 1, y: 0, duration: 0.6 }, '<0.25')
    .to('[data-hero="divider"]', { opacity: 1, scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, '<0.1')
    .to('[data-hero="bottom"]', { opacity: 1, y: 0, duration: 0.6 }, '<0.1');

  // Stat counters count up while the stats block fades in.
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count ?? '0');
    const counter = { value: 0 };
    el.textContent = '0';
    timeline.to(
      counter,
      {
        value: target,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = String(Math.round(counter.value));
        },
      },
      '<'
    );
  });
}

/* ----------------------------- scroll reveals ----------------------------- */

function setupScrollReveals(): void {
  gsap.set('[data-animate]', { y: 36 });

  ScrollTrigger.batch('[data-animate]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        overwrite: true,
      }),
  });
}

/* -------------------------------- background ------------------------------ */

function floatOrbs(): void {
  gsap.utils.toArray<HTMLElement>('.orb').forEach((orb, index) => {
    gsap.to(orb, {
      x: () => gsap.utils.random(-60, 60),
      y: () => gsap.utils.random(-45, 45),
      scale: () => gsap.utils.random(0.94, 1.06),
      duration: () => gsap.utils.random(9, 15),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
      delay: index * -4,
    });
  });

  // Slow depth drift while scrolling — each layer moves at a different rate.
  gsap.utils.toArray<HTMLElement>('.orb-wrap').forEach((wrap, index) => {
    gsap.to(wrap, {
      yPercent: (index + 1) * 7,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 1.2 },
    });
  });
}

function spinCube(): void {
  gsap.to('.hero-cube', {
    rotationX: 360,
    rotationY: 720,
    duration: 48,
    ease: 'none',
    repeat: -1,
  });
  gsap.to('.hero-cube-wrap', {
    y: 18,
    duration: 4.5,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });
}

function setupMouseParallax(): () => void {
  const depths = [0.035, 0.055, 0.02];
  const layers = gsap.utils.toArray<HTMLElement>('.orb-wrap').map((el, index) => ({
    xTo: gsap.quickTo(el, 'x', { duration: 1.4, ease: 'power3.out' }),
    yTo: gsap.quickTo(el, 'y', { duration: 1.4, ease: 'power3.out' }),
    depth: depths[index] ?? 0.03,
  }));

  const onMove = (event: PointerEvent) => {
    const dx = event.clientX - window.innerWidth / 2;
    const dy = event.clientY - window.innerHeight / 2;
    layers.forEach((layer) => {
      layer.xTo(dx * layer.depth);
      layer.yTo(dy * layer.depth);
    });
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  return () => window.removeEventListener('pointermove', onMove);
}

/* ------------------------------ pointer effects --------------------------- */

/**
 * 3D tilt for any element carrying [data-tilt]. Uses document-level
 * delegation so elements added after init (hydrated islands, Swiper loop
 * clones) work without re-binding.
 */
function setupTilt(): () => void {
  let current: HTMLElement | null = null;

  const reset = (el: HTMLElement) =>
    gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.7, ease: 'power3.out' });

  const onMove = (event: PointerEvent) => {
    const el = (event.target as Element | null)?.closest?.('[data-tilt]') as HTMLElement | null;

    if (current && current !== el) {
      reset(current);
      current = null;
    }
    if (!el) return;

    current = el;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(el, {
      rotationY: px * 8,
      rotationX: -py * 6,
      transformPerspective: 1000,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  document.addEventListener('pointermove', onMove, { passive: true });
  return () => {
    document.removeEventListener('pointermove', onMove);
    if (current) reset(current);
  };
}

function setupMagneticButtons(): () => void {
  const cleanups: Array<() => void> = [];

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * 0.3);
      yTo((event.clientY - rect.top - rect.height / 2) * 0.4);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
