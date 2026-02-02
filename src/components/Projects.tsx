import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, X, ChevronLeft, ChevronRight } from 'lucide-react';

const projects = [
  {
    title: 'Naskah Dinas Elektronik (NADINE V3) - Kementerian ESDM',
    description: 'NADINE V3 is a web-based application for internal correspondence administration within the Ministry of Energy and Mineral Resources.',
    year: '2025',
    status: 'live',
    tech: ['Laravel Octane + Road Runner', 'Docker', 'Kubernetes', 'Redis', 'PostgreSQL', 'RabbitMQ', 'Vue 3', 'Pinia', 'Tailwind CSS', 'Element Plus'],
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
    images: ['/images/modi.png']
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
    images: ['/images/noimage.png']
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

  const openLightbox = (images: string[], index: number = 0) => {
    setSelectedImages(images);
    setCurrentImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImages(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImages) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedImages.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImages) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
    }
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
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

        <div className="projects-wrapper">
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
                    <span key={tIdx} className="tech-badge">{tech}</span>
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
              padding: '40px',
            }}
          >
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '40px',
                right: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
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
              <X size={32} />
            </button>

            {selectedImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    left: '40px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100000,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <ChevronLeft size={36} />
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: '40px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100000,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <ChevronRight size={36} />
                </button>
              </>
            )}

            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90%',
                maxHeight: '90vh',
                cursor: 'default',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={selectedImages[currentImageIndex]}
                alt="Project Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
                }}
              />
              {selectedImages.length > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '-40px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '4px 12px',
                  borderRadius: '100px',
                }}>
                  {currentImageIndex + 1} / {selectedImages.length}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    </section>
  );
}
