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
      desktop: '(min-width: 969px)',
    },
    (context) => {
      const { motionOK, pointerFine, desktop } = context.conditions as {
        motionOK: boolean;
        pointerFine: boolean;
        desktop: boolean;
      };
      if (!motionOK) return;

      const cleanups: Array<() => void> = [];

      revealHero();
      heroExitParallax();
      spinCube();
      setupScrollReveals();
      buildMarquees();
      drawTimelineSpines();
      revealCtaLetters();

      if (desktop && pointerFine) {
        buildHorizontalGallery();
        cleanups.push(setupGalleryCursor());
        cleanups.push(setupArchivePreview());
      }

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
    gsap.set('[data-animate], [data-hero], .name-letter, .cta-letter', {
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

  try {
    sessionStorage.setItem('introSeen', '1');
  } catch {
    /* private mode — ignore */
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

  gsap.set('[data-hero]', { y: 26 });
  gsap.set(letters, {
    yPercent: 110,
    rotationX: -80,
    transformPerspective: 600,
    transformOrigin: '50% 100% -20px',
  });

  runHeroEntrance = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('[data-hero="eyebrow"]', { opacity: 1, y: 0, duration: 0.5 })
      .to(
        letters,
        { opacity: 1, yPercent: 0, rotationX: 0, duration: 0.85, stagger: 0.035, ease: 'back.out(1.4)' },
        '-=0.2'
      )
      .to('[data-hero="bottom"]', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .to('[data-hero="stats"]', { opacity: 1, y: 0, duration: 0.6 }, '<0.1');

    document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count ?? '0');
      const value = { n: 0 };
      el.textContent = '0';
      tl.to(
        value,
        {
          n: target,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => (el.textContent = String(Math.round(value.n))),
        },
        '<'
      );
    });
  };
}

function heroExitParallax(): void {
  const wrapper = document.querySelector('[data-hero-exit]');
  if (!wrapper) return;
  // Subtle transform-only depth on exit — content stays fully readable
  // (no opacity fade, no letter-spacing scrub which would thrash layout).
  gsap.to('.hero-name', {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero-eyebrow', {
    yPercent: -30,
    ease: 'none',
    scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero-stats', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
  });
}

function spinCube(): void {
  gsap.to('.hero-cube', { rotationX: 360, rotationY: 720, duration: 48, ease: 'none', repeat: -1 });
  gsap.to('.hero-cube-wrap', { y: 18, duration: 4.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
  gsap.to('.hero-ring', { rotation: 360, duration: 30, ease: 'none', repeat: -1 });
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

function revealCtaLetters(): void {
  const letters = gsap.utils.toArray<HTMLElement>('.cta-letter');
  if (letters.length === 0) return;
  gsap.set(letters, { yPercent: 110 });
  gsap.to(letters, {
    opacity: 1,
    yPercent: 0,
    duration: 0.7,
    ease: 'back.out(1.4)',
    stagger: 0.03,
    scrollTrigger: { trigger: '#contact', start: 'top 70%', once: true },
  });
}

/* -------------------------------- marquees -------------------------------- */

function buildMarquees(): void {
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((row) => {
    const track = row.querySelector<HTMLElement>('.marquee-track');
    const copy = row.querySelector<HTMLElement>('.marquee-copy');
    if (!track || !copy) return;

    const direction = row.dataset.marquee === 'right' ? 1 : -1;
    const width = copy.offsetWidth;
    // Base drift ~ constant speed regardless of content width.
    const baseDuration = width / 60;

    const loop = gsap.to(track, {
      x: direction === -1 ? -width : 0,
      duration: baseDuration,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => {
          const val = parseFloat(x);
          return direction === -1 ? val % width : (val % width) - width;
        }),
      },
    });
    if (direction === 1) gsap.set(track, { x: -width });

    // Scroll velocity nudges playback rate + skews the row for a kinetic feel.
    ScrollTrigger.create({
      trigger: row,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        const skew = gsap.utils.clamp(-12, 12, velocity / 200);
        gsap.to(track, { skewX: skew, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        loop.timeScale(1 + Math.min(Math.abs(velocity) / 1200, 3));
        gsap.to(loop, { timeScale: 1, duration: 0.8, overwrite: 'auto' });
      },
    });
  });

  // Footer wordmark — single slow loop.
  const footerTrack = document.querySelector<HTMLElement>('[data-footer-marquee]');
  if (footerTrack) {
    const half = footerTrack.scrollWidth / 2;
    gsap.to(footerTrack, {
      x: -half,
      duration: half / 50,
      ease: 'none',
      repeat: -1,
      modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % half) },
    });
  }
}

/* --------------------------- horizontal gallery --------------------------- */

function buildHorizontalGallery(): void {
  const pin = document.getElementById('galleryPin');
  const track = document.getElementById('galleryTrack');
  const bar = document.getElementById('galleryProgressBar');
  if (!pin || !track) return;

  const getScrollDistance = () => track.scrollWidth - window.innerWidth * 0.9;

  const tween = gsap.to(track, {
    x: () => -getScrollDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${getScrollDistance()}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (bar) gsap.set(bar, { scaleX: self.progress });
      },
    },
  });

  // Clip-path wipe + fade for each panel's media, tied to the horizontal
  // scrub via containerAnimation (the canonical technique for triggering
  // animations inside a horizontally-scrolled container).
  gsap.utils.toArray<HTMLElement>('.gallery-panel').forEach((panel) => {
    const media = panel.querySelector('.panel-media');
    const info = panel.querySelector('.panel-info');
    if (media) {
      gsap.fromTo(
        media,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tween,
            start: 'left 80%',
            end: 'left 40%',
            scrub: true,
          },
        }
      );
    }
    if (info) {
      gsap.fromTo(
        info,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tween,
            start: 'left 75%',
            end: 'left 45%',
            scrub: true,
          },
        }
      );
    }
  });
}

function setupGalleryCursor(): () => void {
  const cursor = document.getElementById('galleryCursor');
  const media = gsap.utils.toArray<HTMLElement>('.panel-media');
  if (!cursor || media.length === 0) return () => {};

  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power3.out' });
  let active = false;

  const onMove = (e: PointerEvent) => {
    xTo(e.clientX);
    yTo(e.clientY);
    const over = (e.target as Element | null)?.closest?.('.panel-media');
    if (over && !active) {
      active = true;
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    } else if (!over && active) {
      active = false;
      gsap.to(cursor, { scale: 0, duration: 0.25, ease: 'power2.in' });
    }
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  return () => {
    window.removeEventListener('pointermove', onMove);
    gsap.set(cursor, { scale: 0 });
  };
}

function setupArchivePreview(): () => void {
  const preview = document.getElementById('archivePreview');
  const img = document.getElementById('archivePreviewImg') as HTMLImageElement | null;
  const rows = gsap.utils.toArray<HTMLElement>('.archive-row');
  if (!preview || !img || rows.length === 0) return () => {};

  const xTo = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3.out' });
  const yTo = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3.out' });
  const cleanups: Array<() => void> = [];

  const onMove = (e: PointerEvent) => {
    xTo(e.clientX + 24);
    yTo(e.clientY - 100);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  cleanups.push(() => window.removeEventListener('pointermove', onMove));

  rows.forEach((row) => {
    const src = row.dataset.preview;
    const onEnter = () => {
      if (src && img.src !== src) img.src = src;
      gsap.fromTo(
        preview,
        { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
        { opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.4, ease: 'power3.out', overwrite: true }
      );
    };
    const onLeave = () => gsap.to(preview, { opacity: 0, duration: 0.25, overwrite: true });
    row.addEventListener('pointerenter', onEnter);
    row.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      row.removeEventListener('pointerenter', onEnter);
      row.removeEventListener('pointerleave', onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
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
