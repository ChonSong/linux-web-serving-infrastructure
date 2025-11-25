export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  iconName: 'Cpu' | 'Code' | 'Globe' | 'Smartphone' | 'Database' | 'Zap';
  color: string;
  url?: string;
  githubUrl?: string;
  detailedDescription?: string;
  features?: string[];
  challenges?: string[];
  outcomes?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface PersonalInfo {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatar: string;
  location: string;
  email: string;
  phone?: string;
  availability: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  companyLogo?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
  achievements?: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'devops' | 'mobile' | 'design' | 'other';
  proficiency: number; // 1-5 scale
  yearsExperience: number;
  projects?: string[];
  certifications?: string[];
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  tags: string[];
  featured: boolean;
  coverImage?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
  date: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
}

export interface ContactFormData {
  // Basic Information
  name: string;
  email: string;
  phone: string;
  company: string;

  // Project Details
  projectType: ProjectType;
  budget: BudgetRange;
  timeline: TimelineRange;
  projectDescription: string;

  // Additional Information
  howDidYouHear: string;
  attachment?: File;
  contactPreference: ContactPreference;
  urgencyLevel: UrgencyLevel;
}

export interface ProjectType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface BudgetRange {
  id: string;
  label: string;
  range: string;
  description: string;
}

export interface TimelineRange {
  id: string;
  label: string;
  duration: string;
  description: string;
}

export interface MeetingType {
  id: string;
  name: string;
  duration: string;
  description: string;
  icon: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  timezone: string;
}

export interface ContactMethod {
  id: string;
  type: 'email' | 'phone' | 'linkedin' | 'github' | 'twitter' | 'calendly';
  value: string;
  label: string;
  icon: string;
  primary?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  expanded?: boolean;
}

export interface OfficeHours {
  day: string;
  hours: string;
  available: boolean;
}

export interface ContactPreference {
  id: string;
  label: string;
  value: string;
  icon: string;
}

export interface UrgencyLevel {
  id: string;
  label: string;
  description: string;
  responseTime: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface ContactFormSubmission {
  id: string;
  formData: ContactFormData;
  timestamp: string;
  status: 'pending' | 'sent' | 'error';
  responseTime?: string;
}

export interface SiteMetadata {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  siteUrl: string;
  ogImage?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

// Blog-related interfaces
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
  color?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  children?: TableOfContentsItem[];
}

export interface BlogFilter {
  category?: string;
  tags?: string[];
  searchTerm?: string;
  sortBy?: 'date' | 'popularity' | 'readTime';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogPagination {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage: number;
}

export interface BlogStats {
  totalPosts: number;
  featuredPosts: number;
  totalCategories: number;
  totalTags: number;
  averageReadTime: number;
}

export interface ShareButtons {
  url: string;
  title: string;
  description: string;
}

export interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  readTime: number;
  publishedAt: string;
  tags: string[];
}

export interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface BlogPostMetadata {
  wordCount: number;
  estimatedReadTime: number;
  viewCount?: number;
  likeCount?: number;
  bookmarkCount?: number;
}
