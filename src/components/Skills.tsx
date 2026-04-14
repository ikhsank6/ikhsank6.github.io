import React from 'react';
import { getTechIconUrl } from '../utils/techIcons';

const skills = [
  'Laravel', 'Livewire', 'Codeigniter', 'Vue.js', 'React', 'Next.js',
  'TypeScript', 'JavaScript', 'Tailwind CSS', 'Node.js', 'NestJS',
  'Express', 'Prisma', 'PostgreSQL', 'MongoDB', 'MySQL'
];

export default function Skills() {
  return (
    <section id="skills" className="skills-section">
      <div className="section-header animate-on-scroll">
        <div className="section-tag">
          <span className="hashtag">#</span>
          <span>Technical Stack</span>
        </div>
        <h2 className="section-title">My <span className="accent-text">Skills</span></h2>
        <p className="section-description">The technologies and tools I use to bring ideas to life.</p>
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
              width="24"
              height="24"
            />
            <span>{skill}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
