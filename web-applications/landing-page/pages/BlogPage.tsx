import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BlogListing } from '../components/BlogListing';
import { SEO } from '../components/SEO';
import { SITE_METADATA, BLOG_POSTS } from '../content';

export const BlogPage: React.FC = () => {
  const { slug } = useParams();

  // If slug exists, show individual post
  if (slug) {
    // TODO: Implement individual blog post page
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Blog Post</h1>
          <div className="bg-slate-800 rounded-lg p-8">
            <p className="text-gray-300">Individual blog post coming soon...</p>
            <p className="text-gray-400 mt-4">Slug: {slug}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show blog listing
  return (
    <SEO
      title="Blog & Articles"
      description="Insights, tutorials, and case studies about web development, AI integration, and building scalable applications."
      keywords={['Blog', 'Articles', 'Web Development Tutorials', 'React Tutorials', 'Node.js Guides', 'AI Integration', 'Case Studies', ...SITE_METADATA.keywords]}
      canonical="/blog"
    >
      <div className="min-h-screen pt-24 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Blog & Articles
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Insights, tutorials, and case studies about web development,
            AI integration, and building scalable applications.
          </p>
        </motion.div>

        {/* Blog Listing */}
        <BlogListing />
      </div>
    </div>
    </SEO>
  );
};

export default BlogPage;