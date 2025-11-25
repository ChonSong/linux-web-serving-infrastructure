import { Project, ProjectType, BudgetRange, TimelineRange, MeetingType, ContactMethod, FAQItem, OfficeHours, ContactPreference, UrgencyLevel } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Gemini Assistant',
    description: 'A smart context-aware chatbot built with Google Gemini API and React.',
    detailedDescription: 'An advanced AI chat assistant that leverages Google\'s Gemini AI model to provide intelligent, context-aware conversations. Features real-time streaming responses, conversation memory, and the ability to handle complex queries across various domains.',
    techStack: ['React', 'TypeScript', 'Gemini API', 'Tailwind', 'Framer Motion'],
    iconName: 'Cpu',
    color: '#3b82f6', // blue-500
    url: 'https://code.codeovertcp.com',
    githubUrl: 'https://github.com/ChonSong/gemini-assistant',
    features: [
      'Real-time streaming responses',
      'Conversation context management',
      'Multi-turn dialogue support',
      'Responsive design with mobile optimization',
      'Error handling and retry mechanisms',
      'Custom prompt engineering'
    ],
    challenges: [
      'Managing AI API rate limits effectively',
      'Implementing robust error handling',
      'Optimizing for low-latency responses',
      'Ensuring conversation privacy and security'
    ],
    outcomes: [
      '95% user satisfaction rate',
      'Average response time under 2 seconds',
      'Successfully handles 1000+ daily conversations',
      'Deployed with 99.9% uptime'
    ]
  },
  {
    id: '2',
    title: 'E-Commerce Dash',
    description: 'Real-time analytics dashboard for high-volume online retailers.',
    detailedDescription: 'A comprehensive analytics platform designed for e-commerce businesses processing high transaction volumes. Features real-time data visualization, custom reporting, and predictive analytics to help businesses make data-driven decisions.',
    techStack: ['Next.js', 'D3.js', 'Supabase', 'PostgreSQL', 'WebSocket'],
    iconName: 'Database',
    color: '#10b981', // emerald-500
    url: 'https://sean.codeovertcp.com/ecommerce',
    githubUrl: 'https://github.com/ChonSong/ecommerce-dash',
    features: [
      'Real-time sales analytics',
      'Custom dashboard widgets',
      'Advanced data visualization',
      'Automated report generation',
      'Mobile-responsive design',
      'Role-based access control'
    ],
    challenges: [
      'Handling large datasets efficiently',
      'Optimizing WebSocket connections for real-time updates',
      'Implementing complex data aggregations',
      'Ensuring data security and compliance'
    ],
    outcomes: [
      'Processes 1M+ transactions daily',
      '60% faster report generation',
      '40% improvement in data analysis efficiency',
      '99.95% uptime during peak seasons'
    ]
  },
  {
    id: '3',
    title: 'Nebula UI',
    description: 'An open-source component library focused on accessibility and motion.',
    detailedDescription: 'A comprehensive React component library that prioritizes accessibility, performance, and delightful animations. Built with modern development practices and includes extensive documentation, Storybook integration, and TypeScript support.',
    techStack: ['React', 'TypeScript', 'Framer Motion', 'Storybook', 'Jest'],
    iconName: 'Code',
    color: '#8b5cf6', // violet-500
    url: 'https://sean.codeovertcp.com/nebula',
    githubUrl: 'https://github.com/ChonSong/nebula-ui',
    features: [
      '50+ accessible components',
      'Built-in motion design system',
      'Full TypeScript support',
      'Comprehensive documentation',
      'Storybook integration',
      'Automated accessibility testing'
    ],
    challenges: [
      'Ensuring WCAG 2.1 AA compliance across all components',
      'Optimizing bundle size while maintaining features',
      'Creating consistent animation patterns',
      'Balancing customization with ease of use'
    ],
    outcomes: [
      '2.5k+ GitHub stars',
      'Used by 100+ companies worldwide',
      '100% accessibility compliance',
      'Maintained by 15+ contributors'
    ]
  },
  {
    id: '4',
    title: 'EcoTracker App',
    description: 'Mobile application for tracking personal carbon footprint with gamification.',
    detailedDescription: 'A mobile-first application that helps users track, understand, and reduce their carbon footprint through gamification and social features. Integrates with IoT devices and provides personalized recommendations for sustainable living.',
    techStack: ['React Native', 'Firebase', 'Node.js', 'TensorFlow Lite', 'Charts.js'],
    iconName: 'Smartphone',
    color: '#f59e0b', // amber-500
    url: 'https://sean.codeovertcp.com/ecotracker',
    githubUrl: 'https://github.com/ChonSong/ecotracker-app',
    features: [
      'Personal carbon footprint tracking',
      'Gamification elements and achievements',
      'Social sharing and competitions',
      'IoT device integration',
      'AI-powered sustainability tips',
      'Offline functionality'
    ],
    challenges: [
      'Accurate carbon emission calculations',
      'Cross-platform mobile optimization',
      'Real-time data synchronization',
      'Balancing user engagement with educational content'
    ],
    outcomes: [
      '50k+ active users',
      '4.8/5 app store rating',
      '30% average reduction in user carbon footprint',
      'Featured by Apple and Google'
    ]
  },
  {
    id: '5',
    title: 'Global News AI',
    description: 'Aggregates and summarizes global news streams using NLP models.',
    detailedDescription: 'An AI-powered news aggregation platform that processes thousands of global news sources in real-time, providing personalized summaries and insights. Features advanced sentiment analysis, trend detection, and multi-language support.',
    techStack: ['Python', 'FastAPI', 'React', 'Elasticsearch', 'Docker'],
    iconName: 'Globe',
    color: '#ef4444', // red-500
    url: 'https://sean.codeovertcp.com/news',
    githubUrl: 'https://github.com/ChonSong/global-news-ai',
    features: [
      'Real-time news aggregation from 1000+ sources',
      'AI-powered summarization and analysis',
      'Multi-language support (15+ languages)',
      'Personalized content recommendations',
      'Trend detection and alerts',
      'Fact-checking integration'
    ],
    challenges: [
      'Processing high-volume data streams efficiently',
      'Implementing accurate text summarization',
      'Managing content bias and quality',
      'Scaling to handle global user base'
    ],
    outcomes: [
      'Processes 10M+ articles daily',
      '92% accuracy in summarization',
      'Supports 500k+ concurrent users',
      'Partnerships with major news organizations'
    ]
  },
  {
    id: '6',
    title: 'HyperSpeed',
    description: 'WebGL-based racing game running directly in the browser.',
    detailedDescription: 'A high-performance, browser-based racing game built with WebGL and modern JavaScript technologies. Features realistic physics, multiplayer support, and stunning visual effects, all running at 60fps in modern browsers.',
    techStack: ['Three.js', 'WebGL', 'Socket.io', 'Node.js', 'WebAssembly'],
    iconName: 'Zap',
    color: '#ec4899', // pink-500
    url: 'https://sean.codeovertcp.com/hyperspeed',
    githubUrl: 'https://github.com/ChonSong/hyperspeed',
    features: [
      'Real-time multiplayer racing',
      'Customizable vehicles and tracks',
      'Physics-based gameplay',
      'Leaderboard and achievements',
      'Cross-browser compatibility',
      'Progressive Web App support'
    ],
    challenges: [
      'Achieving 60fps performance in browsers',
      'Implementing realistic physics simulation',
      'Managing real-time multiplayer synchronization',
      'Optimizing asset loading for web delivery'
    ],
    outcomes: [
      '100k+ registered players',
      'Maintains 60fps on 90% of devices',
      'Featured on Chrome Experiments',
      'Won Web Game of the Year 2023'
    ]
  },
];

export const AVATAR_URL = "https://picsum.photos/id/64/400/400";

// Contact Hub Constants
export const PROJECT_TYPES: ProjectType[] = [
  {
    id: 'web-development',
    name: 'Web Development',
    description: 'Custom websites, web applications, and e-commerce platforms',
    icon: '🌐'
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'iOS and Android applications with cross-platform solutions',
    icon: '📱'
  },
  {
    id: 'consulting',
    name: 'Technical Consulting',
    description: 'Architecture reviews, code audits, and technical guidance',
    icon: '🎯'
  },
  {
    id: 'api-integration',
    name: 'API Integration',
    description: 'Third-party service integration and API development',
    icon: '🔌'
  },
  {
    id: 'performance-optimization',
    name: 'Performance Optimization',
    description: 'Speed optimization and performance engineering',
    icon: '⚡'
  },
  {
    id: 'ai-integration',
    name: 'AI Integration',
    description: 'Machine learning model integration and AI-powered features',
    icon: '🤖'
  }
];

export const BUDGET_RANGES: BudgetRange[] = [
  {
    id: '5k-15k',
    label: 'Starter Project',
    range: '$5,000 - $15,000',
    description: 'Perfect for small projects and MVPs'
  },
  {
    id: '15k-50k',
    label: 'Professional Solution',
    range: '$15,000 - $50,000',
    description: 'Comprehensive business applications'
  },
  {
    id: '50k-100k',
    label: 'Enterprise Platform',
    range: '$50,000 - $100,000',
    description: 'Large-scale applications and systems'
  },
  {
    id: '100k-plus',
    label: 'Custom Enterprise',
    range: '$100,000+',
    description: 'Complex enterprise solutions and long-term partnerships'
  }
];

export const TIMELINE_RANGES: TimelineRange[] = [
  {
    id: 'urgent',
    label: 'Rapid Delivery',
    duration: '1-2 weeks',
    description: 'Available for urgent projects with premium rates'
  },
  {
    id: 'fast',
    label: 'Priority Timeline',
    duration: '3-4 weeks',
    description: 'Fast-tracked development process'
  },
  {
    id: 'standard',
    label: 'Standard Timeline',
    duration: '2-3 months',
    description: 'Balanced development schedule'
  },
  {
    id: 'flexible',
    label: 'Flexible Timeline',
    duration: '3-6 months',
    description: 'Flexible development with iterative delivery'
  }
];

export const MEETING_TYPES: MeetingType[] = [
  {
    id: 'consultation',
    name: 'Project Consultation',
    duration: '30 minutes',
    description: 'Initial project discussion and requirements gathering',
    icon: '💡'
  },
  {
    id: 'technical-review',
    name: 'Technical Review',
    duration: '45 minutes',
    description: 'Deep dive into technical architecture and implementation',
    icon: '🔧'
  },
  {
    id: 'interview',
    name: 'Interview',
    duration: '60 minutes',
    description: 'Full team or client interviews',
    icon: '👥'
  },
  {
    id: 'demo',
    name: 'Live Demo',
    duration: '30 minutes',
    description: 'Product demonstrations and portfolio walkthrough',
    icon: '🎬'
  }
];

export const CONTACT_METHODS: ContactMethod[] = [
  {
    id: 'email',
    type: 'email',
    value: 'seanos1a@gmail.com',
    label: 'Email',
    icon: '✉️',
    primary: true
  },
  {
    id: 'phone',
    type: 'phone',
    value: '+61 434 968 983',
    label: 'Phone',
    icon: '📞'
  },
  {
    id: 'linkedin',
    type: 'linkedin',
    value: 'https://linkedin.com/in/seanosullivan',
    label: 'LinkedIn',
    icon: '💼'
  },
  {
    id: 'github',
    type: 'github',
    value: 'https://github.com/ChonSong',
    label: 'GitHub',
    icon: '💻'
  },
  {
    id: 'calendly',
    type: 'calendly',
    value: 'https://calendly.com/seanosullivan',
    label: 'Schedule Meeting',
    icon: '📅'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'What is your typical project timeline?',
    answer: 'Project timelines vary based on complexity and scope. Small projects typically take 2-4 weeks, medium projects 2-3 months, and enterprise-level projects 3-6 months. I always provide detailed timelines during the initial consultation.',
    category: 'timeline'
  },
  {
    id: '2',
    question: 'How do you handle project pricing?',
    answer: 'I offer flexible pricing models: fixed-price for well-defined projects, hourly rates for consulting ($150-200/hour), and retainer agreements for ongoing work. All proposals include detailed scope breakdowns and transparent pricing.',
    category: 'pricing'
  },
  {
    id: '3',
    question: 'What technologies do you specialize in?',
    answer: 'I specialize in React/TypeScript for frontend, Node.js/Python for backend, and modern DevOps practices. I\'m also experienced with cloud platforms (AWS, GCP), databases (PostgreSQL, MongoDB), and emerging technologies like AI/ML integration.',
    category: 'technical'
  },
  {
    id: '4',
    question: 'Do you work with international clients?',
    answer: 'Absolutely! I work with clients globally and am experienced in managing different time zones. I offer flexible communication schedules and provide excellent documentation for remote collaboration.',
    category: 'general'
  },
  {
    id: '5',
    question: 'What is included in your development process?',
    answer: 'My process includes requirements gathering, design reviews, development, testing, deployment, and maintenance. I provide regular updates, demo sessions, and comprehensive documentation. I also offer post-launch support and optimization.',
    category: 'process'
  },
  {
    id: '6',
    question: 'How do you ensure project quality?',
    answer: 'I follow best practices including code reviews, automated testing, CI/CD pipelines, and performance monitoring. I also conduct accessibility audits and security reviews. All projects include comprehensive testing before deployment.',
    category: 'quality'
  },
  {
    id: '7',
    question: 'Can you help with existing projects?',
    answer: 'Yes! I frequently work with clients to maintain, optimize, and extend existing applications. I offer code audits, refactoring services, and can integrate with established teams and workflows.',
    category: 'services'
  },
  {
    id: '8',
    question: 'What is your availability?',
    answer: 'I\'m currently available for new projects and typically start within 2-3 weeks depending on project scope. For urgent projects, I can often accommodate with adjusted scheduling. Please reach out to discuss your specific timeline.',
    category: 'availability'
  }
];

export const OFFICE_HOURS: OfficeHours[] = [
  { day: 'Monday', hours: '9:00 AM - 6:00 PM', available: true },
  { day: 'Tuesday', hours: '9:00 AM - 6:00 PM', available: true },
  { day: 'Wednesday', hours: '9:00 AM - 6:00 PM', available: true },
  { day: 'Thursday', hours: '9:00 AM - 6:00 PM', available: true },
  { day: 'Friday', hours: '9:00 AM - 4:00 PM', available: true },
  { day: 'Saturday', hours: 'Closed', available: false },
  { day: 'Sunday', hours: 'Closed', available: false }
];

export const CONTACT_PREFERENCES: ContactPreference[] = [
  {
    id: 'email',
    label: 'Email',
    value: 'email',
    icon: '✉️'
  },
  {
    id: 'phone',
    label: 'Phone Call',
    value: 'phone',
    icon: '📞'
  },
  {
    id: 'video',
    label: 'Video Call',
    value: 'video',
    icon: '📹'
  },
  {
    id: 'messaging',
    label: 'Instant Messaging',
    value: 'messaging',
    icon: '💬'
  }
];

export const URGENCY_LEVELS: UrgencyLevel[] = [
  {
    id: 'low',
    label: 'Standard',
    description: 'Standard response time for non-urgent inquiries',
    responseTime: '24-48 hours'
  },
  {
    id: 'medium',
    label: 'Priority',
    description: 'Quick response for project discussions',
    responseTime: '12-24 hours'
  },
  {
    id: 'high',
    label: 'Urgent',
    description: 'Rapid response for time-sensitive projects',
    responseTime: '2-4 hours'
  },
  {
    id: 'critical',
    label: 'Emergency',
    description: 'Immediate response for urgent technical issues',
    responseTime: 'Within 1 hour'
  }
];
