import React from 'react';
import { getTechIconUrl } from '../utils/techIcons';

// Skills data - using tech names that map to utils/techIcons
const skills = [
  'Laravel',
  'Livewire',
  'Codeigniter',
  'Vue.js',
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Tailwind CSS',
  'Node.js',
  'NestJS',
  'Express',
  'Prisma',
  'PostgreSQL',
  'MongoDB',
  'MySQL',
];

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <div className="section-header">
          <div className="section-tag animate-on-scroll">
            <span className="hashtag">#</span>
            <span>Stack</span>
          </div>
          <h2 className="section-title animate-on-scroll delay-1">
            Technologies I Work With
          </h2>
          <p className="section-description animate-on-scroll delay-2">
            Tools and frameworks I use to bring ideas to life
          </p>
        </div>

        <div className="skills-container">
          {skills.map((skill, idx) => (
            <div
              key={idx}
              className="skill-pill animate-on-scroll"
              style={{ transitionDelay: `${0.05 * idx}s` }}
            >
              <img
                src={getTechIconUrl(skill) || ''}
                alt={skill}
                loading="lazy"
              />
              <span>{skill}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
