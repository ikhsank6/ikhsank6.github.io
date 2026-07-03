import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TechIcon } from './shared/TechIcon';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Navigation, Pagination, Autoplay } from 'swiper/modules';

import { trapFocus } from '../scripts/focus-trap';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const projects = [
  {
    title: 'Regional Investment Project - Kementerian Investasi/BKPM',
    description: 'Regional Investment Project is a web-based application to see a list of investments and investment opportunities in Indonesia. Built with modern stack to handle high-traffic investment data visualization.',
    year: '2025',
    status: 'live',
    tech: ['AdonisJS', 'Prisma', 'TypeScript', 'PostgreSQL', 'NextJS', 'Tailwind CSS', 'ShadcnUI'],
    link: 'https://regionalinvestment.bkpm.go.id/',
    github: '',
    images: ['/images/pir_1.webp', '/images/pir_2.webp'],
    color: '#D4FF00'
  },
  {
    title: 'Naskah Dinas Elektronik (NADINE V3) - Kementerian ESDM',
    description: 'A robust correspondence system for the Ministry of Energy and Mineral Resources. Optimized for high performance and reliability with microservices architecture.',
    year: '2025',
    status: 'live',
    tech: ['Laravel Octane', 'Docker', 'Kubernetes', 'Redis', 'PostgreSQL', 'RabbitMQ', 'Vue 3', 'TypeScript', 'Pinia', 'Tailwind CSS', 'Element Plus'],
    link: 'https://ngantor.esdm.go.id/',
    github: '',
    images: [
      '/images/nadinev3_2.webp',
      '/images/nadinev3.webp',
    ],
    color: '#0066FF'
  },
  {
    title: 'Sistem Informasi Ahli Pers - Dewan Pers',
    description: 'A specialized platform for managing press-related expertise and cases, facilitating streamlined communication and documentation.',
    year: '2024',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://ahlipers.dewanpers.or.id/register',
    github: '',
    images: ['/images/regis_pers.webp', '/images/login_pers.webp'],
    color: '#FFD700'
  },
  {
    title: 'Sistem Informasi Perencanaan Pembangunan Desa Tertinggal - Kementerian Desa',
    description: 'Planning tool for developing lagging villages, focusing on data-driven resource allocation and progress tracking.',
    year: '2024',
    status: 'not-live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: '',
    github: '',
    images: ['/images/sippdt_1.webp', '/images/sippdt_2.webp'],
    color: '#FF4444'
  },
  {
    title: 'LSP BPPTIK - Kementerian Digital dan Informatika',
    description: 'Certification and competency testing management system supporting Indonesia\'s digital human capital development.',
    year: '2023',
    status: 'live',
    tech: ['Codeigniter', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://lspbpptik.komdigi.go.id/',
    github: '',
    images: ['/images/lsp_bpptik.webp'],
    color: '#00F5FF'
  },
  {
    title: 'Sistem Akademik - SESKOAL',
    description: 'Integrated academic administration system for the Indonesian Naval Staff and Command College.',
    year: '2021',
    status: 'live',
    tech: ['Codeigniter', 'PostgreSQL', 'Bootstrap CSS', 'Moodle Integration'],
    link: 'https://smartcampus-seskoal.id/siak/#/',
    github: '',
    images: ['/images/siak_seskoal.webp'],
    color: '#8A2BE2'
  },
  {
    title: 'Minerba One Data Indonesia (MODI) - Kementerian ESDM',
    description: 'Centralized portal for Indonesia\'s mineral and coal sector, integrating geographical data with mining permit administration.',
    year: '2021',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS', 'ArcGIS Service'],
    link: 'https://modi.esdm.go.id/',
    github: '',
    images: [
      '/images/modi_1.webp',
      '/images/modi.webp'],
    color: '#FF8C00'
  },
  {
    title: 'Minerba Verification Process (MVP) - Kementerian ESDM',
    description: 'Streamlined verification system for mineral and coal sales, ensuring regulatory compliance across Indonesia.',
    year: '2020',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://mvp.esdm.go.id/',
    github: '',
    images: ['/images/mvp.webp'],
    color: '#32CD32'
  },
  {
    title: 'ERKAB - Kementerian ESDM',
    description: 'A comprehensive system for mineral and coal companies to submit their Work Plan and Budget reports, facilitating government oversight and planning.',
    year: '2021',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://erkab.esdm.go.id/',
    github: '',
    images: ['/images/erkab.webp'],
    color: '#FF69B4'
  },
  {
    title: 'Dashboard Analytic - Kejaksaan RI',
    description: 'Data analytics platform providing actionable insights and reporting for decision-makers in the Attorney General\'s Office.',
    year: '2020',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://dasti.kejaksaan.go.id/v5/login',
    github: '',
    images: ['/images/dasti.webp'],
    color: '#4682B4'
  },
  {
    title: 'Exploration Management System (EMS) - Kementerian ESDM',
    description: 'Specialized tool for managing exploration activities and data, ensuring organized tracking of mineral resource discovery efforts.',
    year: '2020',
    status: 'not-live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: '',
    github: '',
    images: ['/images/noimage.webp'],
    color: '#708090'
  },
  {
    title: 'Miners - Kementerian ESDM',
    description: 'Administrative reporting system for mining companies to fulfill their regulatory obligations to the Ministry of Energy and Mineral Resources.',
    year: '2019',
    status: 'not-live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: '',
    github: '',
    images: ['/images/miners.webp'],
    color: '#556B2F'
  },
  {
    title: 'MOMS - Kementerian ESDM',
    description: 'Mineral and Coal Online Monitoring System for real-time tracking of production and sales across the Indonesian mining sector.',
    year: '2019',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://moms.esdm.go.id/',
    github: '',
    images: ['/images/moms.webp'],
    color: '#CD5C5C'
  }
];

export default function Projects() {
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Trap keyboard focus inside the lightbox and close on Escape while open.
  React.useEffect(() => {
    if (!selectedImages || !lightboxRef.current) return;
    const releaseFocus = trapFocus(lightboxRef.current);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      releaseFocus();
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedImages]);

  // Robust Panning Logic (matches index.astro pattern)
  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && zoomLevel > 1) {
        setPanPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
        setPanPosition({ 
          x: e.touches[0].clientX - dragStart.x, 
          y: e.touches[0].clientY - dragStart.y 
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

  const openLightbox = (images: string[], title: string, index: number = 0) => {
    setSelectedImages(images);
    setSelectedTitle(title);
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

  const resetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
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

  return (
    <section id="projects" className="projects-section">
      <div className="section-header" data-animate>
        <div className="section-tag">
          <span className="hashtag">#</span>
          <span>My Portfolio</span>
          <span className="project-count">{projects.length} Projects</span>
        </div>
        <h2 className="section-title">Featured <span className="accent-text">Work</span></h2>
        <p className="section-description">
          A selection of government and private sector projects I've led and developed.
        </p>
      </div>

      <div className="projects-slider-wrapper" data-animate>
        <Swiper
          modules={[A11y, Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          preventClicks={false}
          preventClicksPropagation={false}
          autoplay={
            prefersReducedMotion
              ? false
              : {
                  delay: 4000,
                  disableOnInteraction: true,
                }
          }
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination-custom',
          }}
          breakpoints={{
            1024: {
              slidesPerView: 1.2,
              spaceBetween: 40,
            }
          }}
          className="projects-swiper"
        >
          {projects.map((project, idx) => (
            <SwiperSlide key={idx} className="project-slide">
              <div className="project-slide-content" data-tilt>
                <div className="project-slide-image-container">
                  <div
                    className="project-slide-image clickable"
                    role="button"
                    tabIndex={0}
                    aria-label={`View screenshots of ${project.title}`}
                    onClick={() => project.images && project.images.length > 0 && openLightbox(project.images, project.title)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (project.images && project.images.length > 0) openLightbox(project.images, project.title);
                      }
                    }}
                    title="Click to view screenshots"
                  >
                    <img src={project.images[0]} alt={project.title} loading="lazy" />
                    <div className="project-image-overlay">
                      <div className="view-details">
                        <ZoomIn size={32} />
                        <span>Click to Expand</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="project-slide-info">
                  <div className="project-slide-meta">
                    <span className="slide-year">{project.year}</span>
                    <span className={`slide-status ${project.status}`}>{project.status}</span>
                  </div>
                  <h3 className="slide-title">{project.title}</h3>
                  <p className="slide-description">{project.description}</p>
                  
                  <div className="slide-tech">
                    {project.tech.slice(0, 6).map((tech, i) => (
                      <TechIcon key={i} tech={tech} />
                    ))}
                    {project.tech.length > 6 && <span className="tech-more">+{project.tech.length - 6}</span>}
                  </div>

                  <div className="slide-actions">
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="slide-link">
                        Live Preview <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          
          {/* Custom Navigation */}
          <div className="slider-controls">
            <button className="swiper-button-prev-custom" aria-label="Previous slide">
              <ChevronLeft size={24} />
            </button>
            <div className="swiper-pagination-custom"></div>
            <button className="swiper-button-next-custom" aria-label="Next slide">
              <ChevronRight size={24} />
            </button>
          </div>
        </Swiper>
      </div>

      {/* Project Lightbox Modal */}
      {selectedImages && createPortal(
        <div
          className="project-lightbox-overlay active"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={selectedTitle}
          ref={lightboxRef}
        >
          <button className="project-lightbox-close" onClick={closeLightbox} aria-label="Close modal">
            <X size={24} />
          </button>

          <div className="project-lightbox-title">
            <h4>{selectedTitle}</h4>
          </div>

          <div className="project-lightbox-content">
            <div
              className="project-lightbox-image-container"
              ref={containerRef}
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
                    y: e.touches[0].clientY - panPosition.y 
                  });
                }
              }}
              style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <img
                src={selectedImages[currentImageIndex]}
                alt="Project Preview"
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

                {selectedImages.length > 1 && (
                  <>
                    <div className="controls-divider"></div>
                    <button onClick={prevImage} title="Previous" aria-label="Previous image"><ChevronLeft size={20} /></button>
                    <span className="nav-index">{currentImageIndex + 1} / {selectedImages.length}</span>
                    <button onClick={nextImage} title="Next" aria-label="Next image"><ChevronRight size={20} /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
