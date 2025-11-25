import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Search, Filter, Grid, List, Calendar, TrendingUp } from 'lucide-react';
import { BlogPost } from '../types';
import { BLOG_POSTS } from '../content';
import { BlogCard } from './BlogCard';
import { getFeaturedPosts, sortBlogPostsByDate } from '../utils';

interface BlogListingProps {
  posts?: BlogPost[];
  showFilters?: boolean;
  layout?: 'grid' | 'list';
}

export const BlogListing: React.FC<BlogListingProps> = ({
  posts = BLOG_POSTS,
  showFilters = true,
  layout: initialLayout = 'grid'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'readTime'>('date');
  const [layout, setLayout] = useState(initialLayout);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Get unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [posts]);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Tag filter
    if (selectedTag !== 'all') {
      filtered = filtered.filter(post =>
        post.tags.includes(selectedTag)
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'popularity':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'readTime':
          return b.readTime - a.readTime;
        default:
          return 0;
      }
    });
  }, [posts, searchTerm, selectedTag, sortBy]);

  const featuredPosts = getFeaturedPosts(posts);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Featured Posts */}
      {featuredPosts.length > 0 && selectedTag === 'all' && !searchTerm && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Featured Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredPosts.map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                variant="featured"
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
        >
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400"
              />
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none"
              >
                <option value="all">All Topics</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              <option value="date">Latest First</option>
              <option value="popularity">Featured</option>
              <option value="readTime">Reading Time</option>
            </select>

            {/* Layout Toggle */}
            <div className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg p-1">
              <button
                onClick={() => setLayout('grid')}
                className={`p-2 rounded transition-colors ${
                  layout === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-2 rounded transition-colors ${
                  layout === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          {selectedTag === 'all' && !searchTerm ? 'All Articles' : `Search Results`}
        </h3>
        <span className="text-slate-400">
          {filteredAndSortedPosts.length} {filteredAndSortedPosts.length === 1 ? 'article' : 'articles'}
        </span>
      </div>

      {/* Blog Posts Grid */}
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
        className={layout === 'grid'
          ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-6"
        }
      >
        {filteredAndSortedPosts.map((post, index) => (
          <motion.div
            key={post.id}
            variants={itemVariants}
            className={layout === 'list' ? 'w-full' : ''}
          >
            <BlogCard
              post={post}
              variant={layout === 'list' ? 'compact' : 'default'}
              index={index}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* No Results */}
      {filteredAndSortedPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
          <p className="text-slate-400 mb-4">
            {searchTerm || selectedTag !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Check back later for new content'
            }
          </p>
          {(searchTerm || selectedTag !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('all');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Load More (for pagination) */}
      {filteredAndSortedPosts.length > 9 && (
        <div className="text-center pt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg hover:bg-slate-600/50 transition-colors"
          >
            Load More Articles
          </motion.button>
        </div>
      )}
    </div>
  );
};