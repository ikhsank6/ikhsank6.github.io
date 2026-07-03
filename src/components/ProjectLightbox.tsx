import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

import { trapFocus } from '../scripts/focus-trap';

interface OpenDetail {
  images: string[];
  title: string;
  /** Rect of the clicked thumbnail — used for the FLIP shared-element entrance. */
  sourceRect?: DOMRect;
}

/**
 * Global project lightbox island. The static gallery dispatches
 * `project:open` CustomEvents; this island owns all zoom/pan/index state.
 */
export default function ProjectLightbox() {
  const [detail, setDetail] = useState<OpenDetail | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const lightboxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Open on gallery events.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<OpenDetail>).detail;
      if (!d?.images?.length) return;
      setDetail(d);
      setCurrentImageIndex(0);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    };
    window.addEventListener('project:open', onOpen);
    return () => window.removeEventListener('project:open', onOpen);
  }, []);

  // FLIP shared-element entrance: animate the lightbox image from the
  // clicked thumbnail's rect to its final position (WAAPI, respects
  // reduced motion via the media query check).
  useEffect(() => {
    if (!detail?.sourceRect || !imageRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const img = imageRef.current;
    const animateFromSource = () => {
      const target = img.getBoundingClientRect();
      if (target.width === 0) return;
      const source = detail.sourceRect as DOMRect;
      const dx = source.left + source.width / 2 - (target.left + target.width / 2);
      const dy = source.top + source.height / 2 - (target.top + target.height / 2);
      const scale = source.width / target.width;
      img.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, borderRadius: '24px' },
          { transform: 'translate(0, 0) scale(1)', borderRadius: '8px' },
        ],
        { duration: 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    };

    if (img.complete) animateFromSource();
    else img.addEventListener('load', animateFromSource, { once: true });
    return () => img.removeEventListener('load', animateFromSource);
  }, [detail]);

  // Focus trap + Escape while open.
  useEffect(() => {
    if (!detail || !lightboxRef.current) return;
    const releaseFocus = trapFocus(lightboxRef.current);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      releaseFocus();
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [detail]);

  // Pan while zoomed.
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (zoomLevel > 1) {
        setPanPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (zoomLevel > 1 && e.touches.length === 1) {
        setPanPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        });
      }
    };
    const handleEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, zoomLevel, dragStart]);

  const closeLightbox = () => {
    setDetail(null);
    setCurrentImageIndex(0);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    document.body.style.overflow = '';
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const zoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };
  const changeImage = (delta: number) => {
    if (!detail) return;
    setCurrentImageIndex((prev) => (prev + delta + detail.images.length) % detail.images.length);
    resetZoom();
  };

  if (!detail) return null;

  return createPortal(
    <div
      className="project-lightbox-overlay active"
      onClick={closeLightbox}
      role="dialog"
      aria-modal="true"
      aria-label={detail.title}
      ref={lightboxRef}
    >
      <button className="project-lightbox-close" onClick={closeLightbox} aria-label="Close modal">
        <X size={24} />
      </button>

      <div className="project-lightbox-title">
        <h4>{detail.title}</h4>
      </div>

      <div className="project-lightbox-content">
        <div
          className="project-lightbox-image-container"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => {
            if (zoomLevel > 1) {
              setIsDragging(true);
              setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
            }
          }}
          onTouchStart={(e) => {
            if (zoomLevel > 1 && e.touches.length === 1) {
              setIsDragging(true);
              setDragStart({
                x: e.touches[0].clientX - panPosition.x,
                y: e.touches[0].clientY - panPosition.y,
              });
            }
          }}
          style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <img
            ref={imageRef}
            src={detail.images[currentImageIndex]}
            alt={`${detail.title} screenshot ${currentImageIndex + 1}`}
            draggable={false}
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        <div className="project-lightbox-controls" onClick={(e) => e.stopPropagation()}>
          <div className="project-controls-bar">
            <button onClick={zoomOut} disabled={zoomLevel <= 1} title="Zoom Out" aria-label="Zoom out"><ZoomOut size={18} /></button>
            <span className="zoom-value">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={zoomIn} disabled={zoomLevel >= 3} title="Zoom In" aria-label="Zoom in"><ZoomIn size={18} /></button>
            <div className="controls-divider"></div>
            <button onClick={resetZoom} title="Reset" aria-label="Reset zoom"><RotateCcw size={18} /></button>

            {detail.images.length > 1 && (
              <>
                <div className="controls-divider"></div>
                <button onClick={() => changeImage(-1)} title="Previous" aria-label="Previous image"><ChevronLeft size={20} /></button>
                <span className="nav-index">{currentImageIndex + 1} / {detail.images.length}</span>
                <button onClick={() => changeImage(1)} title="Next" aria-label="Next image"><ChevronRight size={20} /></button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
