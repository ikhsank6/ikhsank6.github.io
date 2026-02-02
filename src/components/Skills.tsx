import React, { useEffect } from 'react';

const skills = [
  { name: 'Laravel', slug: 'laravel' },
  { name: 'Livewire', slug: 'livewire' },
  { name: 'CodeIgniter', slug: 'codeigniter' },
  { name: 'Vue.js', slug: 'vuedotjs' },
  { name: 'React', slug: 'react' },
  { name: 'Next.js', slug: 'nextdotjs' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'Tailwind CSS', slug: 'tailwindcss' },
  { name: 'Node.js', slug: 'nodedotjs' },
  { name: 'NestJS', slug: 'nestjs' },
  { name: 'Express', slug: 'express' },
  { name: 'Prisma', slug: 'prisma' },
  { name: 'PostgreSQL', slug: 'postgresql' },
  { name: 'MongoDB', slug: 'mongodb' },
  { name: 'MySQL', slug: 'mysql' },
];

export default function Skills() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
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
                src={`https://cdn.simpleicons.org/${skill.slug}`} 
                alt={skill.name}
                loading="lazy"
              />
              <span>{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
