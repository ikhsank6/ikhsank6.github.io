import React, { useEffect } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';

const projects = [
  {
    title: 'Cafe POS System',
    description: 'A comprehensive Point of Sale system for cafes with inventory management, real-time analytics, sales reporting, and multi-outlet support.',
    year: '2024',
    status: 'dev',
    tech: ['NestJS', 'React', 'Prisma', 'TypeScript'],
    link: 'https://cafe-pos.demo',
    github: 'https://github.com/ikhsank6',
    image: null
  },
  {
    title: 'Digital Correspondence',
    description: 'Enterprise web application for managing incoming and outgoing official letters with workflow approval, digital signatures, and document tracking.',
    year: '2023',
    status: 'live',
    tech: ['Laravel', 'Livewire', 'Tailwind CSS', 'MySQL'],
    link: 'https://e-surat.demo',
    github: 'https://github.com/ikhsank6',
    image: null
  },
  {
    title: 'Personal Portfolio',
    description: 'Modern developer portfolio built with Astro and React featuring smooth animations, dark theme, and responsive design inspired by Framer.',
    year: '2024',
    status: 'live',
    tech: ['Astro', 'React', 'CSS'],
    link: 'https://ikhsank6.github.io',
    github: 'https://github.com/ikhsank6/ikhsank6.github.io',
    image: null
  }
];

export default function Projects() {
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
              style={{ transitionDelay: `${0.1 * idx}s` }}
            >
              <div className="project-content">
                <div className="project-meta">
                  <span className="project-year">{project.year}</span>
                  <span className={`project-status ${project.status}`}>
                    {project.status === 'live' ? 'Live' : 'In Development'}
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
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    View Project
                    <ArrowUpRight size={14} />
                  </a>
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link secondary"
                  >
                    <Github size={16} />
                    Source
                  </a>
                </div>
              </div>
              
              <div className="project-image">
                <span className="project-placeholder">
                  {project.title.split(' ').map(w => w[0]).join('')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
