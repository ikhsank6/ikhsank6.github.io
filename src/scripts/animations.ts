import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Central animation entry point. Every motion concern lives here, registered
 * inside gsap.matchMedia() contexts so reduced-motion and pointer/viewport
 * capabilities are honoured automatically and torn down leak-free on revert.
 *
 * Initial hidden states live in CSS under the `.js` scope, so no-JS visitors
 * and reduced-motion users always see fully-painted content.
 */
export function initAnimations(): void {
  const mm = gsap.matchMedia();

  // Motion-enabled visitors: full choreography.
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

      revealHero();
      heroExitParallax();
      setupScrollReveals();
      buildMarquees();
      drawTimelineSpines();

      if (pointerFine) {
        cleanups.push(setupTilt());
        cleanups.push(setupMagneticButtons());
      }

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      cleanups.push(() => window.removeEventListener('load', refresh));

      return () => cleanups.forEach((fn) => fn());
    }
  );

  // Reduced-motion visitors: reveal everything immediately, no motion.
  mm.add('(prefers-reduced-motion: reduce)', () => {
    document.getElementById('preloader')?.remove();
    gsap.set('[data-animate], [data-hero], .name-letter', {
      opacity: 1,
      y: 0,
      clearProps: 'transform',
    });
  });

  // Preloader runs outside matchMedia (it is a one-shot, not a media context)
  // but only for motion-enabled visitors; it hands off to the hero timeline.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    runPreloader();
  }
}

/* ------------------------------- preloader -------------------------------- */

function runPreloader(): void {
  const preloader = document.getElementById('preloader');
  const skip = document.documentElement.classList.contains('skip-intro');

  if (!preloader || skip) {
    preloader?.remove();
    startHeroTimeline();
    return;
  }

  // Lock scroll during the intro.
  const { body } = document;
  const prevOverflow = body.style.overflow;
  body.style.overflow = 'hidden';

  const letters = preloader.querySelectorAll('.preloader-letter');
  const counter = { value: 0 };
  const counterEl = document.getElementById('preloaderCount');

  gsap.set(letters, { yPercent: 110 });

  const tl = gsap.timeline({
    defaults: { ease: 'power4.out' },
    onComplete: () => {
      body.style.overflow = prevOverflow;
      preloader.remove();
      startHeroTimeline();
    },
  });

  tl.to('.preloader-label', { opacity: 1, duration: 0.4 })
    .to(letters, { yPercent: 0, duration: 0.75, stagger: 0.035 }, '-=0.1')
    .to(
      counter,
      {
        value: 100,
        duration: 1.0,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (counterEl) counterEl.textContent = String(Math.round(counter.value));
        },
      },
      '<'
    )
    .to('.preloader-inner', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, '+=0.15')
    .to('.preloader-panel-top', { yPercent: -100, duration: 0.7, ease: 'power4.inOut' }, '<0.1')
    .to('.preloader-panel-bottom', { yPercent: 100, duration: 0.7, ease: 'power4.inOut' }, '<');
}

/* --------------------------------- hero ----------------------------------- */

// The hero entrance is a standalone timeline so it can fire either after the
// preloader wipe or immediately (skip-intro). Guarded so it only runs once.
let heroStarted = false;

function startHeroTimeline(): void {
  if (heroStarted) return;
  heroStarted = true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof runHeroEntrance === 'function') runHeroEntrance();
}

let runHeroEntrance: (() => void) | null = null;

function revealHero(): void {
  const letters = gsap.utils.toArray<HTMLElement>('.name-letter');

  // Crossing a breakpoint makes gsap.matchMedia revert this context and re-run
  // the callback. By then the intro has already played and cannot play again
  // (startHeroTimeline is one-shot), so re-arming the hidden state would strand
  // the name and portrait invisible for the rest of the session. Paint the
  // finished state instead.
  if (heroStarted) {
    gsap.set('[data-hero]', { opacity: 1, y: 0, scale: 1 });
    gsap.set(letters, { opacity: 1, yPercent: 0, rotationX: 0 });
    return;
  }

  gsap.set('[data-hero]', { y: 26 });
  gsap.set(letters, {
    yPercent: 110,
    rotationX: -80,
    transformPerspective: 600,
    transformOrigin: '50% 100% -20px',
  });

  // The portrait rises last and settles behind the surname's tail — the
  // occlusion only reads once it has landed.
  gsap.set('[data-hero="portrait"]', { y: 44, scale: 1.04, transformOrigin: '50% 100%' });

  runHeroEntrance = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('[data-hero="eyebrow"]', { opacity: 1, y: 0, duration: 0.5 })
      .to(
        letters,
        { opacity: 1, yPercent: 0, rotationX: 0, duration: 0.85, stagger: 0.035, ease: 'back.out(1.4)' },
        '-=0.2'
      )
      .to(
        '[data-hero="portrait"]',
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' },
        '-=0.55'
      )
      .to('[data-hero="bottom"]', { opacity: 1, y: 0, duration: 0.6 }, '-=0.6')
      .to('[data-hero="stats"]', { opacity: 1, y: 0, duration: 0.6 }, '<0.1');

    document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const raw = el.dataset.count ?? '0';
      const target = Number(raw);
      if (!Number.isFinite(target)) return;
      // Keep any leading zero the markup declared ("05" must not tick to "5").
      const width = raw.length;
      const value = { n: 0 };
      el.textContent = '0'.repeat(width);
      tl.to(
        value,
        {
          n: target,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = String(Math.round(value.n)).padStart(width, '0');
          },
        },
        '<'
      );
    });
  };
}

function heroExitParallax(): void {
  const wrapper = document.querySelector('[data-hero-exit]');
  if (!wrapper) return;

  const exit = { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } as const;

  // Subtle transform-only depth on exit — content stays fully readable
  // (no opacity fade, no letter-spacing scrub which would thrash layout).
  gsap.to('.hero-name', {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: { ...exit },
  });
  gsap.to('.hero-eyebrow', {
    yPercent: -30,
    ease: 'none',
    scrollTrigger: { ...exit },
  });
  gsap.to('.hero-ledger', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: { ...exit },
  });

  // The signature: the portrait drifts away faster and further right than the
  // name, so the surname's occluded tail completes itself as the hero leaves.
  gsap.to('.hero-portrait', {
    yPercent: 26,
    xPercent: 14,
    ease: 'none',
    scrollTrigger: { ...exit },
  });
}

/* ----------------------------- scroll reveals ----------------------------- */

function setupScrollReveals(): void {
  gsap.set('[data-animate]', { y: 34 });
  ScrollTrigger.batch('[data-animate]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  });
}

/* -------------------------------- marquees -------------------------------- */

function buildMarquees(): void {
  // Static Windows Phone tile grid layout replaces marquee scrolling
}

/* ------------------------------- timeline --------------------------------- */

function drawTimelineSpines(): void {
  gsap.utils.toArray<HTMLElement>('.timeline-spine').forEach((spine) => {
    gsap.to(spine, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: spine, start: 'top 85%', end: 'bottom 60%', scrub: true },
    });
  });
}

/* ------------------------------ pointer FX -------------------------------- */

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
      rotationY: px * 10,
      rotationX: -py * 8,
      transformPerspective: 900,
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
  return () => cleanups.forEach((fn) => fn());
}
