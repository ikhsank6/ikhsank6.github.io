const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Traps keyboard focus inside `container` and moves focus to its first
 * focusable element. Returns a cleanup function that removes the trap and
 * restores focus to the element that was focused before the trap activated.
 */
export function trapFocus(container: HTMLElement): () => void {
  const previouslyFocused = document.activeElement as HTMLElement | null;

  const getFocusable = () =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusable = getFocusable();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !container.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', handleKeydown, true);

  // Containers often open with a visibility/opacity transition; focus() fails
  // while still hidden, so retry once the transition has started.
  const focusFirst = () => {
    const first = getFocusable()[0];
    first?.focus();
    return document.activeElement === first;
  };
  if (!focusFirst()) {
    setTimeout(focusFirst, 120);
  }

  return () => {
    document.removeEventListener('keydown', handleKeydown, true);
    previouslyFocused?.focus();
  };
}
