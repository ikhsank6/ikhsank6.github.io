export type ProjectStatus = 'live' | 'dev' | 'not-live';

export interface Project {
  title: string;
  /** Short client/organization label shown in meta rows. */
  client: string;
  description: string;
  year: string;
  status: ProjectStatus;
  tech: string[];
  link: string;
  images: string[];
}

export const projects: Project[] = [
  {
    title: 'Regional Investment',
    client: 'Kementerian Investasi / BKPM',
    description:
      'Web platform mapping investments and investment opportunities across Indonesia, built to handle high-traffic investment data visualization.',
    year: '2025',
    status: 'live',
    tech: ['AdonisJS', 'Prisma', 'TypeScript', 'PostgreSQL', 'NextJS', 'Tailwind CSS', 'ShadcnUI'],
    link: 'https://regionalinvestment.bkpm.go.id/',
    images: ['/images/pir_1.webp', '/images/pir_2.webp'],
  },
  {
    title: 'NADINE V3',
    client: 'Kementerian ESDM',
    description:
      'Electronic correspondence system for the Ministry of Energy and Mineral Resources — microservices architecture optimized for performance and reliability.',
    year: '2025',
    status: 'live',
    tech: ['Laravel Octane', 'Docker', 'Kubernetes', 'Redis', 'PostgreSQL', 'RabbitMQ', 'Vue 3', 'TypeScript', 'Pinia', 'Tailwind CSS', 'Element Plus'],
    link: 'https://ngantor.esdm.go.id/nadine',
    images: ['/images/nadinev3_2.webp', '/images/nadinev3.webp'],
  },
  {
    title: 'Sistem Informasi Ahli Pers',
    client: 'Dewan Pers',
    description:
      'Specialized platform for managing press-related expertise and cases, streamlining communication and documentation.',
    year: '2024',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://ahlipers.dewanpers.or.id/register',
    images: ['/images/regis_pers.webp', '/images/login_pers.webp'],
  },
  {
    title: 'SIPPDT',
    client: 'Kementerian Desa',
    description:
      'Planning tool for developing lagging villages, focused on data-driven resource allocation and progress tracking.',
    year: '2024',
    status: 'not-live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: '',
    images: ['/images/sippdt_1.webp', '/images/sippdt_2.webp'],
  },
  {
    title: 'LSP BPPTIK',
    client: 'Kementerian Digital dan Informatika',
    description:
      "Certification and competency testing management system supporting Indonesia's digital human capital development.",
    year: '2023',
    status: 'live',
    tech: ['Codeigniter', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://lspbpptik.komdigi.go.id/',
    images: ['/images/lsp_bpptik.webp'],
  },
  {
    title: 'Sistem Akademik SESKOAL',
    client: 'TNI AL — SESKOAL',
    description:
      'Integrated academic administration system for the Indonesian Naval Staff and Command College.',
    year: '2021',
    status: 'live',
    tech: ['Codeigniter', 'PostgreSQL', 'Bootstrap CSS', 'Moodle Integration'],
    link: 'https://smartcampus-seskoal.id/siak/#/',
    images: ['/images/siak_seskoal.webp'],
  },
  {
    title: 'MODI',
    client: 'Kementerian ESDM',
    description:
      "Centralized portal for Indonesia's mineral and coal sector, integrating geographical data with mining permit administration.",
    year: '2021',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS', 'ArcGIS Service'],
    link: 'https://modi.esdm.go.id/',
    images: ['/images/modi_1.webp', '/images/modi.webp'],
  },
  {
    title: 'ERKAB',
    client: 'Kementerian ESDM',
    description:
      'Work Plan and Budget reporting system for mineral and coal companies, facilitating government oversight and planning.',
    year: '2021',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://erkab.esdm.go.id/',
    images: ['/images/erkab.webp'],
  },
  {
    title: 'MVP',
    client: 'Kementerian ESDM',
    description:
      'Verification system for mineral and coal sales, ensuring regulatory compliance across Indonesia.',
    year: '2020',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://mvp.esdm.go.id/',
    images: ['/images/mvp.webp'],
  },
  {
    title: 'Dashboard Analytic',
    client: 'Kejaksaan RI',
    description:
      "Data analytics platform providing actionable insights and reporting for decision-makers in the Attorney General's Office.",
    year: '2020',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://dasti.kejaksaan.go.id/v5/login',
    images: ['/images/dasti.webp'],
  },
  {
    title: 'EMS',
    client: 'Kementerian ESDM',
    description:
      'Exploration management tool for organized tracking of mineral resource discovery efforts.',
    year: '2020',
    status: 'not-live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: '',
    images: ['/images/noimage.webp'],
  },
  {
    title: 'Miners',
    client: 'Kementerian ESDM',
    description:
      'Administrative reporting system for mining companies fulfilling regulatory obligations.',
    year: '2019',
    status: 'not-live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: '',
    images: ['/images/miners.webp'],
  },
  {
    title: 'MOMS',
    client: 'Kementerian ESDM',
    description:
      'Mineral and Coal Online Monitoring System for real-time production and sales tracking across the mining sector.',
    year: '2019',
    status: 'live',
    tech: ['Laravel', 'PostgreSQL', 'Bootstrap CSS'],
    link: 'https://moms.esdm.go.id/',
    images: ['/images/moms.webp'],
  },
];

/** Flagship work shown in the pinned horizontal gallery. */
export const featuredProjects = projects.slice(0, 6);

/** Older work shown in the archive list. */
export const archiveProjects = projects.slice(6);

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: 'Live',
  dev: 'In Development',
  'not-live': 'Not Active',
};
