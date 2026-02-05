import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { TechIcon } from './shared/TechIcon';

const projects = [
  {
    title: 'Regional Investment Project - Kementerian Investasi/BKPM',
    description: 'Regional Investment Project is a web-based application to see a list of investments and investment opportunities in Indonesia.',
    year: '2025',
    status: 'live',
    tech: ['AdonisJS', 'Prisma', 'TypeScript', 'PostgreSQL', 'NextJS', 'Tailwind CSS', 'ShadcnUI'],
    link: 'https://regionalinvestment.bkpm.go.id/',
    github: '',
    images: ['/images/pir_1.png', '/images/pir_2.png']
  },
  {
    title: 'Naskah Dinas Elektronik (NADINE V3) - Kementerian ESDM',
    description: 'NADINE V3 is a web-based application for internal correspondence administration within the Ministry of Energy and Mineral Resources.',
    year: '2025',
    status: 'live',
    tech: ['Laravel Octane + Road Runner', 'Docker', 'Kubernetes', 'Redis', 'PostgreSQL', 'RabbitMQ', 'Vue 3', 'TypeScript', 'Pinia', 'Tailwind CSS', 'Element Plus'],
    link: 'https://ngantor.esdm.go.id/',
    github: '',
    images: [
      '/images/nadinev3_2.png',
      '/images/nadinev3.png',
    ]
  },
  {
    title: 'Sistem Informasi Perencanaan Pembangunan Desa Tertinggal - Kementerian Desa, Pembangunan Daerah Tertinggal dan Transmigrasi',
    description: 'SIPPDT is a web-based application for planning the development of lagging villages in Indonesia.',
    year: '2024',
    status: 'not-live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: '',
    github: '',
    images: ['/images/sippdt_1.png', '/images/sippdt_2.png']
  },
  {
    title: 'LSP BPPTIK - Kementerian Digital dan Informatika',
    description: 'BNSP\'s supporting institution in implementing competency testing and certification, LSP BPPTIK applies SKKNI-based certification.',
    year: '2023',
    status: 'live',
    tech: ['Codeigniter', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://lspbpptik.komdigi.go.id/',
    github: '',
    images: ['/images/lsp_bpptik.png']
  },

  {
    title: 'Sistem Akademik - SESKOAL',
    description: 'SIAK is a web-based application for managing academic administration within the Seskoal.',
    year: '2021',
    status: 'live',
    tech: ['Codeigniter', 'PostgreSQL', 'Bootstrap CSS', 'Integrasi Moodle'],
    link: 'https://smartcampus-seskoal.id/siak/#/',
    github: '',
    images: ['/images/siak_seskoal.png']
  },
  {
    title: 'Minerba One Data Indonesia (MODI) - Kementerian ESDM',
    description: 'Minerba One Data Indonesia (MODI) is a web-based application for mineral and coal companies to apply for Mining Business Permit (WIUP) permits in Indonesia. It is a government project currently operated by the Indonesian Ministry of Energy and Mineral Resources.',
    year: '2021',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS', 'Service ArcGIS'],
    link: 'https://modi.esdm.go.id/',
    github: '',
    images: [
      '/images/modi_1.png',
      '/images/modi.png']
  },
  {
    title: 'ERKAB - Kementerian ESDM',
    description: 'ERKAB is a web-based application for administering the Work Plan and Budget reporting of mineral and coal companies in Indonesia to the Ministry of Energy and Mineral Resources. It is a government project currently used by the Indonesian Ministry of Energy and Mineral Resources.',
    year: '2021',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://erkab.esdm.go.id/',
    github: '',
    images: ['/images/erkab.png']
  },
  {
    title: 'Dashboard Analytic - Kejaksaan RI',
    description: 'Dashboard Analytic is a web-based application for analyzing data.',
    year: '2020',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://dasti.kejaksaan.go.id/v5/login',
    github: '',
    images: ['/images/dasti.png']
  },
  {
    title: 'Minerba Verification Proccess (MVP) - Kementerian ESDM',
    description: 'The Minerba Verification Process (MVP) is a web-based application for verifying sales by mineral and coal companies in Indonesia. It is a government project currently operated by the Indonesian Ministry of Energy and Mineral Resources.',
    year: '2020',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://mvp.esdm.go.id/',
    github: '',
    images: ['/images/mvp.png']
  },
  {
    title: 'Exploration Management System (EMS) - Kementerian ESDM',
    description: 'EMS is a web-based application for managing exploration data of mineral and coal companies in Indonesia.',
    year: '2020',
    status: 'not-live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: '',
    github: '',
    images: ['/images/noimage.png']
  },
  {
    title: 'Miners - Kementerian ESDM',
    description: 'MINERS is a web-based application for administering reporting by mineral and coal companies in Indonesia to the Ministry of Energy and Mineral Resources. It is a government project currently used by the Indonesian Ministry of Energy and Mineral Resources.',
    year: '2019',
    status: 'not-live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: '',
    github: '',
    images: ['/images/miners.png']
  },
  {
    title: 'MOMS - Kementerian ESDM',
    description: 'MOMS is a web-based application for managing mineral and coal sales and reporting stock levels held by mineral and coal companies in Indonesia. It is a government project currently used by the Indonesian Ministry of Energy and Mineral Resources.',
    year: '2019',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://moms.esdm.go.id/',
    github: '',
    images: ['/images/moms.png']
  }
];

export default function Projects() {
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const openLightbox = (images: string[], index: number = 0) => {
    setSelectedImages(images);
    setCurrentImageIndex(index);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImages(null);
    setCurrentImageIndex(0);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'auto';
  };

  const zoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newZoom = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoom);
    if (newZoom === 1) {
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      e.preventDefault();
      setPanPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImages) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedImages.length);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImages) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
        if (e.cancelable) e.preventDefault();
        setPanPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        });
      }
    };

    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, [isDragging, zoomLevel, dragStart]);

  useEffect(() => {
    const cards = document.querySelectorAll('.project-card');
    const projectsSection = document.getElementById('projects');
    if (cards.length === 0 || !projectsSection) return;

    let isVisible = false;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });

    observer.observe(projectsSection);

    const updateStacking = () => {
      if (!isVisible || window.innerWidth <= 968) return;

      window.requestAnimationFrame(() => {
        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const nextCard = cards[index + 1];
          const el = card as HTMLElement;
          const overlay = el.querySelector('.project-card-overlay') as HTMLElement;

          if (nextCard) {
            const nextRect = nextCard.getBoundingClientRect();
            const overlap = Math.max(0, Math.min(1, (rect.bottom - nextRect.top) / rect.height));

            if (overlap > 0) {
              const scale = 1 - (overlap * 0.05);
              const opacity = 1 - (overlap * 0.2);

              el.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
              el.style.opacity = `${opacity}`;
              if (overlay) overlay.style.opacity = `${overlap * 0.6}`;
              return;
            }
          }

          // Reset
          if (el.style.transform !== 'translate3d(0px, 0px, 0px) scale(1)') {
            el.style.transform = 'translate3d(0, 0, 0) scale(1)';
            el.style.opacity = '1';
            if (overlay) overlay.style.opacity = '0';
          }
        });
      });
    };

    window.addEventListener('scroll', updateStacking, { passive: true });
    updateStacking();

    // Carousel mobile dots logic
    const carousel = document.getElementById('projectsCarousel');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    let currentActiveIndex = 0;

    const updateDots = () => {
      if (!carousel) return;
      const scrollLeft = carousel.scrollLeft;
      const cardWidth = carousel.firstElementChild?.clientWidth || 0;
      const gap = 16;
      const newActiveIndex = Math.round(scrollLeft / (cardWidth + gap));

      if (newActiveIndex !== currentActiveIndex && newActiveIndex >= 0 && newActiveIndex < dots.length) {
        dots[currentActiveIndex]?.classList.remove('active');
        dots[newActiveIndex]?.classList.add('active');
        currentActiveIndex = newActiveIndex;
      }
    };

    carousel?.addEventListener('scroll', updateDots, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateStacking);
      carousel?.removeEventListener('scroll', updateDots);
    };
  }, []);

  return (
    <section id="projects">
      <div className="container">
        <div className="section-header">
          <div className="section-tag animate-on-scroll">
            <span className="hashtag">#</span>
            <span>Work</span>
          </div>
          <h2 className="section-title animate-on-scroll delay-1">
            Featured Projects
          </h2>
          <p className="section-description animate-on-scroll delay-2">
            A selection of projects I've worked on
          </p>
        </div>

        {/* Carousel Dot Indicators for Mobile */}
        <div className="carousel-dots" id="carouselDots">
          {projects.map((_, idx) => (
            <span key={idx} className={`dot ${idx === 0 ? 'active' : ''}`} data-index={idx}></span>
          ))}
        </div>

        <div className="projects-wrapper" id="projectsCarousel">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="project-card animate-on-scroll"
              style={{
                transitionDelay: `${0.1 * idx}s`,
                '--index': idx
              } as React.CSSProperties}
            >
              <div className="project-content">
                {/* Darkening overlay for stacking effect */}
                <div className="project-card-overlay" />
                <div className="project-meta">
                  <span className="project-year">{project.year}</span>
                  <span className={`project-status ${project.status}`}>
                    {project.status === 'live' ? 'Live' :
                      project.status === 'not-live' ? 'Offline' :
                        'In Development'}
                  </span>
                </div>

                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>

                <div className="project-tech">
                  {project.tech.map((tech, tIdx) => (
                    <TechIcon key={tIdx} tech={tech} />
                  ))}
                </div>

                <div className="project-links">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      View Project
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </div>

              <div
                className="project-image"
                onClick={() => project.images && project.images.length > 0 && openLightbox(project.images)}
                style={{ cursor: project.images && project.images.length > 0 ? 'zoom-in' : 'default' }}
              >
                {project.images && project.images.length > 0 ? (
                  <>
                    <img src={project.images[0]} alt={project.title} loading="lazy" />
                    {project.images.length > 1 && (
                      <div className="image-count">
                        +{project.images.length - 1} more
                      </div>
                    )}
                  </>
                ) : (
                  <span className="project-placeholder">
                    {project.title.split(' ').map(w => w[0]).join('')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal - Rendered via Portal */}
        {selectedImages && createPortal(
          <div
            onClick={closeLightbox}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(10px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out',
              padding: '20px',
            }}
          >
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 100000,
              }}
            >
              <X size={24} />
            </button>

            {selectedImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100000,
                  }}
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100000,
                  }}
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '95%',
                maxHeight: '90vh',
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              <img
                src={selectedImages[currentImageIndex]}
                alt="Project Preview"
                draggable={false}
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Zoom Controls */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                padding: '8px 16px',
                borderRadius: '100px',
                zIndex: 100001,
              }}
            >
              <button
                onClick={zoomOut}
                disabled={zoomLevel <= 1}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: zoomLevel <= 1 ? 'rgba(255,255,255,0.3)' : 'white',
                  cursor: zoomLevel <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                }}
              >
                <ZoomOut size={24} />
              </button>
              <span style={{
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '600',
                minWidth: '50px',
                textAlign: 'center',
              }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={zoomLevel >= 3}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: zoomLevel >= 3 ? 'rgba(255,255,255,0.3)' : 'white',
                  cursor: zoomLevel >= 3 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                }}
              >
                <ZoomIn size={24} />
              </button>
              {selectedImages.length > 1 && (
                <span style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.8rem',
                  marginLeft: '8px',
                  paddingLeft: '12px',
                  borderLeft: '1px solid rgba(255,255,255,0.3)',
                }}>
                  {currentImageIndex + 1} / {selectedImages.length}
                </span>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    </section>
  );
}
