import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BlogPost } from '../types';
import { Clock, Calendar, ArrowRight, BookOpen, Heart, Bookmark } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  post,
  variant = 'default',
  className = ''
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: `${window.location.origin}/blog/${post.slug}`,
      });
    }
  };

  const cardVariants = {
    default: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    },
    featured: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
    },
    compact: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
    }
  };

  const CardContent = () => (
    <>
      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {post.featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Featured
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleBookmark}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Bookmark article"
            >
              <Bookmark
                size={16}
                className={`text-white ${isBookmarked ? 'fill-current' : ''}`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Share article"
            >
              <ArrowRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`p-6 ${variant === 'featured' ? 'p-8' : ''}`}>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className={`font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors ${
          variant === 'featured' ? 'text-2xl' : 'text-xl'
        }`}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-slate-400 mb-4 line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {post.readTime} min read
            </span>
          </div>

          {variant !== 'compact' && (
            <div className="flex items-center gap-2">
              <BookOpen size={14} />
              <span>{Math.ceil(post.content.split(' ').length / 200)} min</span>
            </div>
          )}
        </div>

        {/* Read More */}
        <div className="mt-4 flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
          <span>Read article</span>
          <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </>
  );

  return (
    <motion.article
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={cardVariants[variant]}
      whileHover={{ y: -4 }}
      className={`bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all duration-300 group ${className}`}
    >
      <a href={`/blog/${post.slug}`} className="block h-full">
        <CardContent />
      </a>
    </motion.article>
  );
};

export default BlogCard;