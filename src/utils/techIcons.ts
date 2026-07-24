/**
 * Tech Icon Utilities
 * Centralized mapping for technology names to SimpleIcons slugs
 */

// SimpleIcons CDN base URL
export const SIMPLE_ICONS_CDN = 'https://cdn.simpleicons.org';

// Complete tech slug mapping - single source of truth
export const techSlugs: Record<string, string> = {
  // Backend Frameworks
  'Laravel': 'laravel',
  'Laravel Octane + Road Runner': 'laravel',
  'Laravel Octane': 'laravel',
  'Codeigniter': 'codeigniter',
  'NestJS': 'nestjs',
  'Express': 'express',
  'AdonisJS': 'adonisjs',
  
  // Frontend Frameworks
  'Vue 3': 'vuedotjs',
  'Vue.js': 'vuedotjs',
  'React': 'react',
  'Next.js': 'nextdotjs',
  'Livewire': 'livewire',
  'NextJS': 'nextdotjs',
  // Languages
  'TypeScript': 'typescript',
  'JavaScript': 'javascript',
  
  // CSS Frameworks
  'Tailwind CSS': 'tailwindcss',
  'Bootstrap CSS': 'bootstrap',
  
  // Databases
  'PostgreSQL': 'postgresql',
  'MySQL': 'mysql',
  'MongoDB': 'mongodb',
  'Redis': 'redis',
  
  // DevOps & Infrastructure
  'Docker': 'docker',
  'Kubernetes': 'kubernetes',
  
  // State Management & UI Libraries
  'Pinia': 'pinia',
  'Element Plus': 'element',
  'Prisma': 'prisma',
  'ShadcnUI': 'shadcnui',
  
  // Message Queues & Services
  'RabbitMQ': 'rabbitmq',
  'Service ArcGIS': 'esri',
  'ArcGIS Service': 'esri',
  'Moodle': 'moodle',
  'Integrasi Moodle': 'moodle',
  'Moodle Integration': 'moodle',
  
  // Runtime
  'Node.js': 'nodedotjs',

  // Mapping / GIS
  'Leaflet': 'leaflet',
};

// Custom icon override URLs for technologies requiring specific icon variants
export const customTechIcons: Record<string, string> = {
  'Redis': '/images/redis.svg',
};

/**
 * Get the SimpleIcons or custom URL for a technology
 * @param tech - Technology name
 * @returns Icon URL or null if not found
 */
export function getTechIconUrl(tech: string): string | null {
  if (!tech) return null;

  const lower = tech.toLowerCase().trim();

  // Custom icon override lookup
  const matchedCustomKey = Object.keys(customTechIcons).find(
    (key) => key.toLowerCase() === lower
  );
  if (matchedCustomKey) {
    return customTechIcons[matchedCustomKey];
  }

  // Direct lookup
  if (techSlugs[tech]) {
    return `${SIMPLE_ICONS_CDN}/${techSlugs[tech]}`;
  }

  // Case-insensitive lookup
  const matchedKey = Object.keys(techSlugs).find(
    (key) => key.toLowerCase() === lower
  );
  if (matchedKey) {
    return `${SIMPLE_ICONS_CDN}/${techSlugs[matchedKey]}`;
  }

  // Keyword fallback (e.g. Moodle in "Moodle Integration")
  if (lower.includes('moodle')) {
    return `${SIMPLE_ICONS_CDN}/moodle`;
  }
  if (lower.includes('arcgis') || lower.includes('esri')) {
    return `${SIMPLE_ICONS_CDN}/esri`;
  }

  return null;
}

/**
 * Check if a technology has an icon available
 * @param tech - Technology name
 * @returns boolean
 */
export function hasTechIcon(tech: string): boolean {
  const lower = tech.toLowerCase().trim();
  return (
    Object.keys(customTechIcons).some((k) => k.toLowerCase() === lower) ||
    tech in techSlugs ||
    Object.keys(techSlugs).some((k) => k.toLowerCase() === lower)
  );
}

/**
 * Get all available technologies
 * @returns Array of technology names
 */
export function getAllTechs(): string[] {
  return Array.from(new Set([...Object.keys(techSlugs), ...Object.keys(customTechIcons)]));
}

