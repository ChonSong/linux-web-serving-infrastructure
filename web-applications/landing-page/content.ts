import {
  PersonalInfo,
  Experience,
  Education,
  Skill,
  SkillCategory,
  BlogPost,
  Testimonial,
  SiteMetadata,
} from './types';

export const PERSONAL_INFO: PersonalInfo = {
  name: "Sean O'Sullivan",
  title: "Senior Full-Stack Developer",
  tagline: "Building innovative digital experiences with cutting-edge technology",
  bio: "Passionate full-stack developer with 8+ years of experience creating scalable web applications, AI-powered solutions, and innovative digital products. I specialize in React, Node.js, and cloud architecture, with a deep interest in machine learning and automation.",
  avatar: "https://picsum.photos/id/64/400/400",
  location: "Sydney, Australia",
  email: "seanos1a@gmail.com",
  phone: "+61 434 968 983",
  availability: "Available for freelance and consulting projects",
};

export const EXPERIENCES: Experience[] = [
  {
    id: '1',
    company: 'TechCorp Solutions',
    position: 'Senior Full-Stack Developer',
    location: 'San Francisco, CA',
    startDate: '2021-06',
    current: true,
    description: 'Leading development of enterprise-scale applications using React, Node.js, and cloud technologies. Architected microservices infrastructure serving 1M+ users.',
    achievements: [
      'Reduced application load time by 60% through optimization and caching strategies',
      'Led migration from monolithic to microservices architecture',
      'Mentored team of 5 junior developers',
      'Implemented CI/CD pipeline reducing deployment time by 70%',
      'Built real-time analytics dashboard processing 10M+ events daily'
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes']
  },
  {
    id: '2',
    company: 'Digital Innovations Inc',
    position: 'Full-Stack Developer',
    location: 'Austin, TX',
    startDate: '2019-03',
    endDate: '2021-05',
    description: 'Developed and maintained multiple client projects using modern JavaScript frameworks. Implemented RESTful APIs and responsive front-end applications.',
    achievements: [
      'Delivered 15+ client projects on time and under budget',
      'Improved code quality by implementing testing standards',
      'Reduced bug reports by 45% through comprehensive testing',
      'Created reusable component library saving 200+ development hours'
    ],
    technologies: ['Vue.js', 'Express.js', 'MongoDB', 'GraphQL', 'Jest', 'Webpack', 'Sass']
  },
  {
    id: '3',
    company: 'StartupHub',
    position: 'Frontend Developer',
    location: 'New York, NY',
    startDate: '2017-01',
    endDate: '2019-02',
    description: 'Focused on creating responsive, user-friendly interfaces for various startup projects. Collaborated closely with UX/UI designers to implement pixel-perfect designs.',
    achievements: [
      'Increased user engagement by 40% through UX improvements',
      'Implemented design system across 5 products',
      'Optimized mobile performance achieving 95+ Lighthouse scores',
      'Collaborated with cross-functional teams in Agile environment'
    ],
    technologies: ['React', 'JavaScript ES6+', 'CSS3', 'HTML5', 'Figma', 'Git', 'Agile']
  }
];

export const EDUCATION: Education[] = [
  {
    id: '1',
    institution: 'University of California, Berkeley',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    startDate: '2013-09',
    endDate: '2017-05',
    gpa: '3.8',
    achievements: [
      'Dean\'s List for 6 semesters',
      'President of Computer Science Club',
      'Won first place in annual hackathon 2016',
      'Published research paper on machine learning algorithms'
    ]
  }
];

export const SKILLS: Skill[] = [
  // Frontend
  { id: '1', name: 'React', category: 'frontend', proficiency: 5, yearsExperience: 6, projects: ['Gemini Assistant', 'E-Commerce Dash', 'Nebula UI'], certifications: ['React Certification'] },
  { id: '2', name: 'TypeScript', category: 'frontend', proficiency: 5, yearsExperience: 5, projects: ['Gemini Assistant', 'Nebula UI'] },
  { id: '3', name: 'JavaScript', category: 'frontend', proficiency: 5, yearsExperience: 8, projects: ['All Projects'] },
  { id: '4', name: 'Vue.js', category: 'frontend', proficiency: 4, yearsExperience: 3 },
  { id: '5', name: 'Tailwind CSS', category: 'frontend', proficiency: 5, yearsExperience: 4, projects: ['Gemini Assistant', 'Portfolio'] },
  { id: '6', name: 'Framer Motion', category: 'frontend', proficiency: 4, yearsExperience: 2, projects: ['Portfolio', 'Nebula UI'] },

  // Backend
  { id: '7', name: 'Node.js', category: 'backend', proficiency: 5, yearsExperience: 6, projects: ['EcoTracker App', 'Global News AI'] },
  { id: '8', name: 'Python', category: 'backend', proficiency: 4, yearsExperience: 5, projects: ['Global News AI'] },
  { id: '9', name: 'Express.js', category: 'backend', proficiency: 5, yearsExperience: 6 },
  { id: '10', name: 'FastAPI', category: 'backend', proficiency: 4, yearsExperience: 2, projects: ['Global News AI'] },
  { id: '11', name: 'PostgreSQL', category: 'backend', proficiency: 4, yearsExperience: 4 },
  { id: '12', name: 'MongoDB', category: 'backend', proficiency: 4, yearsExperience: 3 },

  // DevOps
  { id: '13', name: 'AWS', category: 'devops', proficiency: 4, yearsExperience: 4 },
  { id: '14', name: 'Docker', category: 'devops', proficiency: 4, yearsExperience: 3 },
  { id: '15', name: 'Kubernetes', category: 'devops', proficiency: 3, yearsExperience: 2 },
  { id: '16', name: 'CI/CD', category: 'devops', proficiency: 4, yearsExperience: 4 },
  { id: '17', name: 'Git', category: 'devops', proficiency: 5, yearsExperience: 8 },

  // Mobile
  { id: '18', name: 'React Native', category: 'mobile', proficiency: 3, yearsExperience: 2, projects: ['EcoTracker App'] },
  { id: '19', name: 'iOS Development', category: 'mobile', proficiency: 2, yearsExperience: 1 },

  // Other
  { id: '20', name: 'Machine Learning', category: 'other', proficiency: 3, yearsExperience: 2, projects: ['Global News AI'] },
  { id: '21', name: 'Three.js', category: 'other', proficiency: 3, yearsExperience: 2, projects: ['HyperSpeed'] },
  { id: '22', name: 'WebGL', category: 'other', proficiency: 3, yearsExperience: 2, projects: ['HyperSpeed'] },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Frontend Development',
    description: 'Modern JavaScript frameworks and UI libraries',
    skills: SKILLS.filter(skill => skill.category === 'frontend')
  },
  {
    name: 'Backend Development',
    description: 'Server-side technologies and databases',
    skills: SKILLS.filter(skill => skill.category === 'backend')
  },
  {
    name: 'DevOps & Infrastructure',
    description: 'Cloud platforms and deployment tools',
    skills: SKILLS.filter(skill => skill.category === 'devops')
  },
  {
    name: 'Mobile Development',
    description: 'Cross-platform mobile application development',
    skills: SKILLS.filter(skill => skill.category === 'mobile')
  },
  {
    name: 'Other Technologies',
    description: 'Specialized skills and emerging technologies',
    skills: SKILLS.filter(skill => skill.category === 'other')
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Building AI-Powered Chat Interfaces with React and Gemini',
    slug: 'building-ai-chat-interfaces-react-gemini',
    excerpt: 'Learn how to create intelligent chat applications using Google\'s Gemini API and modern React patterns.',
    content: `# Building AI-Powered Chat Interfaces with React and Gemini

In this comprehensive guide, we'll explore how to build sophisticated chat applications using React and Google's Gemini AI API. We'll cover everything from basic setup to advanced features like context management and streaming responses.

## Getting Started

First, let's set up our React project with the necessary dependencies:

\`\`\`bash
npm create vite@latest ai-chat-app -- --template react-ts
cd ai-chat-app
npm install @google/genai framer-motion lucide-react
\`\`\`

## Core Concepts

### 1. Message Management
We'll use TypeScript interfaces to ensure type safety:

\`\`\`typescript
interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}
\`\`\`

### 2. State Management
Using React hooks for managing conversation state and AI responses.

### 3. Streaming Responses
Implementing real-time streaming for better user experience.

## Advanced Features

- Context awareness
- Conversation history
- Error handling
- Performance optimization

## Conclusion

Building AI-powered interfaces requires careful consideration of user experience, performance, and security. The techniques covered here provide a solid foundation for creating sophisticated AI applications.`,
    publishedAt: '2024-01-15',
    readTime: 8,
    tags: ['React', 'AI', 'TypeScript', 'Gemini', 'Tutorial'],
    featured: true,
    coverImage: 'https://picsum.photos/id/50/1200/600'
  },
  {
    id: '2',
    title: 'Microservices Architecture: Lessons from Production',
    slug: 'microservices-architecture-production-lessons',
    excerpt: 'Real-world insights into building and scaling microservices architectures based on 3+ years of production experience.',
    content: `# Microservices Architecture: Production Lessons

After migrating multiple applications from monolithic to microservices architecture, I've gathered valuable insights about what works and what doesn't in production environments.

## The Migration Journey

### Before the Migration
Our monolithic application was showing signs of strain:
- Slow deployment cycles
- Tight coupling between components
- Scalability challenges
- Technology debt accumulation

### The Strategy
We adopted a gradual migration approach:
1. Identify bounded contexts
2. Extract service boundaries
3. Implement API gateways
4. Migrate data gradually
5. Decommission legacy components

## Technical Challenges

### 1. Service Discovery
Implementing efficient service discovery mechanisms was crucial for our distributed system.

### 2. Data Consistency
Managing data consistency across services required careful planning and implementation of saga patterns.

### 3. Monitoring & Observability
We learned that comprehensive monitoring is non-negotiable in distributed systems.

## Best Practices

1. **Start Small**: Begin with a few well-defined services
2. **Implement Circuit Breakers**: Prevent cascading failures
3. **Use API Gateways**: Centralize cross-cutting concerns
4. **Invest in Testing**: Comprehensive testing is essential
5. **Plan for Failure**: Assume services will fail

## Tools & Technologies

- Container orchestration with Kubernetes
- Service mesh with Istio
- Monitoring with Prometheus and Grafana
- Logging with ELK stack

## Results

Our migration resulted in:
- 70% faster deployment cycles
- Improved scalability and reliability
- Better developer productivity
- Enhanced system resilience

## Conclusion

Microservices architecture offers significant benefits but requires careful planning and implementation. The key is to start with a clear strategy and evolve based on production feedback.`,
    publishedAt: '2024-01-10',
    readTime: 12,
    tags: ['Microservices', 'Architecture', 'DevOps', 'Kubernetes', 'Production'],
    featured: true
  },
  {
    id: '3',
    title: 'Performance Optimization in React Applications',
    slug: 'react-performance-optimization-techniques',
    excerpt: 'Advanced techniques for optimizing React application performance in production environments.',
    content: `# React Performance Optimization: Advanced Techniques

Performance optimization is crucial for delivering excellent user experiences. Here are proven techniques I've used in production applications.

## Measuring Performance

Before optimizing, we need to measure:

### 1. Chrome DevTools
- Performance tab for runtime analysis
- Lighthouse for comprehensive audits
- Memory tab for leak detection

### 2. React DevTools Profiler
Identify performance bottlenecks in component rendering.

## Optimization Techniques

### 1. Code Splitting
\`\`\`javascript
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <React.Suspense fallback={<Loading />}>
      <LazyComponent />
    </React.Suspense>
  );
}
\`\`\`

### 2. Memoization
\`\`\`typescript
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{expensiveCalculation(data)}</div>;
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id;
});
\`\`\`

### 3. Virtualization
For long lists, use react-window or react-virtualized.

### 4. Bundle Optimization
- Tree shaking
- Dead code elimination
- Compression

## Advanced Patterns

### 1. State Management
Optimize state updates to prevent unnecessary re-renders.

### 2. Image Optimization
- WebP format support
- Lazy loading
- Responsive images

### 3. Caching Strategies
- Service workers
- HTTP caching
- Memory caching

## Results

Implementing these techniques resulted in:
- 60% faster initial load
- 40% reduction in bundle size
- 90+ Lighthouse scores
- Better Core Web Vitals

## Conclusion

Performance optimization is an ongoing process. Regular monitoring and optimization are key to maintaining high performance standards.`,
    publishedAt: '2024-01-05',
    readTime: 10,
    tags: ['React', 'Performance', 'Optimization', 'Web Vitals', 'Best Practices'],
    featured: false
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    position: 'CTO',
    company: 'TechCorp Solutions',
    content: 'Sean is an exceptional developer who consistently delivers high-quality work. His expertise in React and Node.js, combined with his problem-solving skills, made him invaluable to our team. He led our microservices migration and delivered results beyond our expectations.',
    rating: 5,
    avatar: 'https://picsum.photos/id/20/100/100',
    date: '2023-12-01'
  },
  {
    id: '2',
    name: 'Michael Chen',
    position: 'Product Manager',
    company: 'Digital Innovations Inc',
    content: 'Working with Sean was a fantastic experience. He has a unique ability to understand complex requirements and translate them into elegant technical solutions. His attention to detail and commitment to quality set him apart from other developers.',
    rating: 5,
    avatar: 'https://picsum.photos/id/21/100/100',
    date: '2023-11-15'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    position: 'UX Designer',
    company: 'StartupHub',
    content: 'Sean is one of the few developers who truly understands the importance of user experience. He consistently brings design ideas to life with pixel-perfect implementation and suggests improvements that enhance the overall user journey.',
    rating: 5,
    avatar: 'https://picsum.photos/id/22/100/100',
    date: '2023-10-20'
  }
];

export const SITE_METADATA: SiteMetadata = {
  title: "Sean O'Sullivan - Full-Stack Developer",
  description: "Senior Full-Stack Developer specializing in React, Node.js, and cloud technologies. Building innovative digital experiences with cutting-edge technology.",
  keywords: [
    'Full-Stack Developer',
    'React Developer',
    'Node.js Developer',
    'TypeScript',
    'Web Development',
    'Software Engineering',
    'Cloud Architecture',
    'Microservices',
    'AI Integration',
    'Sydney Developer'
  ],
  author: "Sean O'Sullivan",
  siteUrl: 'https://sean.codeovertcp.com',
  ogImage: 'https://sean.codeovertcp.com/og-image.jpg'
};

// Utility functions for content
export const getTotalExperience = (experiences: Experience[]): string => {
  const totalMonths = experiences.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 +
                  (end.getMonth() - start.getMonth());
    return total + months;
  }, 0);

  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  } else if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
};