import { format, parseISO } from 'date-fns';
import { Experience, Skill, BlogPost } from '../types';

// Date utilities
export const formatDate = (dateString: string, formatString: string = 'MMMM yyyy'): string => {
  try {
    return format(parseISO(dateString), formatString);
  } catch (error) {
    return dateString;
  }
};

export const formatDateRange = (startDate: string, endDate?: string): string => {
  const start = formatDate(startDate);
  if (!endDate) {
    return `${start} - Present`;
  }
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

export const calculateDuration = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const months = (end.getFullYear() - start.getFullYear()) * 12 +
                (end.getMonth() - start.getMonth());

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  } else if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }
};

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Experience utilities
export const sortExperienceByDate = (experiences: Experience[]): Experience[] => {
  return [...experiences].sort((a, b) => {
    const dateA = new Date(a.endDate || Date.now());
    const dateB = new Date(b.endDate || Date.now());
    return dateB.getTime() - dateA.getTime();
  });
};

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

// Skills utilities
export const getProficiencyLevel = (proficiency: number): {
  label: string;
  color: string;
  percentage: number;
} => {
  const levels = [
    { min: 1, max: 1, label: 'Beginner', color: 'bg-red-500', percentage: 20 },
    { min: 2, max: 2, label: 'Novice', color: 'bg-orange-500', percentage: 40 },
    { min: 3, max: 3, label: 'Intermediate', color: 'bg-yellow-500', percentage: 60 },
    { min: 4, max: 4, label: 'Advanced', color: 'bg-blue-500', percentage: 80 },
    { min: 5, max: 5, label: 'Expert', color: 'bg-green-500', percentage: 100 },
  ];

  const level = levels.find(l => proficiency >= l.min && proficiency <= l.max);
  return level || levels[2]; // Default to intermediate
};

export const groupSkillsByCategory = (skills: Skill[]): Record<string, Skill[]> => {
  return skills.reduce((groups, skill) => {
    const category = skill.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(skill);
    return groups;
  }, {} as Record<string, Skill[]>);
};

export const getTopSkills = (skills: Skill[], limit: number = 10): Skill[] => {
  return [...skills]
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, limit);
};

// Blog utilities
export const sortBlogPostsByDate = (posts: BlogPost[]): BlogPost[] => {
  return [...posts].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
};

export const getFeaturedPosts = (posts: BlogPost[], limit: number = 3): BlogPost[] => {
  return posts
    .filter(post => post.featured)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
};

export const getRelatedPosts = (currentPost: BlogPost, allPosts: BlogPost[], limit: number = 3): BlogPost[] => {
  return allPosts
    .filter(post => post.id !== currentPost.id)
    .filter(post => {
      // Find posts with matching tags
      const currentTags = currentPost.tags || [];
      const postTags = post.tags || [];
      return currentTags.some(tag => postTags.includes(tag));
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
};

// SEO utilities
export const generateMetaTags = (data: {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}) => {
  const tags: Array<{ name: string; content: string; property?: string }> = [];

  if (data.title) {
    tags.push({ name: 'title', content: data.title });
    tags.push({ property: 'og:title', content: data.title });
    tags.push({ name: 'twitter:title', content: data.title });
  }

  if (data.description) {
    tags.push({ name: 'description', content: data.description });
    tags.push({ property: 'og:description', content: data.description });
    tags.push({ name: 'twitter:description', content: data.description });
  }

  if (data.keywords) {
    tags.push({ name: 'keywords', content: data.keywords.join(', ') });
  }

  if (data.ogImage) {
    tags.push({ property: 'og:image', content: data.ogImage });
    tags.push({ name: 'twitter:image', content: data.ogImage });
  }

  if (data.canonical) {
    tags.push({ name: 'canonical', content: data.canonical });
  }

  return tags;
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Analytics utilities
export const trackPageView = (path: string, title?: string) => {
  // This would integrate with Google Analytics or other analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      page_title: title,
    });
  }
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  // This would integrate with Google Analytics or other analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};