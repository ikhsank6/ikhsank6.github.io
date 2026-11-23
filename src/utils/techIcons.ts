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
  'MariaDB': 'mariadb',
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

// Display categories for the project detail modal. Names are matched
// case-insensitively; anything unlisted lands in "Other" so a new tech never
// disappears from the modal just because it has no category yet.
const techCategories: Record<string, string> = {
  'Laravel': 'Backend',
  'Laravel Octane': 'Backend',
  'Laravel Octane + Road Runner': 'Backend',
  'Codeigniter': 'Backend',
  'NestJS': 'Backend',
  'Express': 'Backend',
  'AdonisJS': 'Backend',
  'Node.js': 'Backend',
  'Prisma': 'Backend',

  'Vue 3': 'Frontend',
  'Vue.js': 'Frontend',
  'React': 'Frontend',
  'Next.js': 'Frontend',
  'NextJS': 'Frontend',
  'Livewire': 'Frontend',
  'Tailwind CSS': 'Frontend',
  'Bootstrap CSS': 'Frontend',
  'Pinia': 'Frontend',
  'Element Plus': 'Frontend',
  'ShadcnUI': 'Frontend',

  'TypeScript': 'Language',
  'JavaScript': 'Language',

  'PostgreSQL': 'Database',
  'MySQL': 'Database',
  'MariaDB': 'Database',
  'MongoDB': 'Database',
  'Redis': 'Database',

  'Docker': 'DevOps',
  'Kubernetes': 'DevOps',

  'RabbitMQ': 'Services & GIS',
  'Leaflet': 'Services & GIS',
  'Service ArcGIS': 'Services & GIS',
  'ArcGIS Service': 'Services & GIS',
  'Moodle': 'Services & GIS',
  'Integrasi Moodle': 'Services & GIS',
  'Moodle Integration': 'Services & GIS',
};

const CATEGORY_ORDER = ['Backend', 'Frontend', 'Language', 'Database', 'DevOps', 'Services & GIS', 'Other'];

export interface TechGroup {
  label: string;
  items: string[];
}

/**
 * Group a project's tech list by category, in a fixed display order.
 * Items keep their original order within a group; empty groups are dropped.
 */
export function groupTechs(techs: string[]): TechGroup[] {
  const lookup = new Map(Object.entries(techCategories).map(([k, v]) => [k.toLowerCase(), v]));
  const buckets = new Map<string, string[]>();
  for (const tech of techs) {
    const category = lookup.get(tech.toLowerCase().trim()) ?? 'Other';
    buckets.set(category, [...(buckets.get(category) ?? []), tech]);
  }
  return CATEGORY_ORDER.filter((label) => buckets.has(label)).map((label) => ({
    label,
    items: buckets.get(label)!,
  }));
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

