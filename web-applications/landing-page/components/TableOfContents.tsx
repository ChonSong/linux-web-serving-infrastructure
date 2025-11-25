import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ChevronRight, X } from 'lucide-react';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  content,
  className = ''
}) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Extract headings from content (simple implementation)
    const extractedHeadings: TocItem[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h2Match) {
        extractedHeadings.push({
          id: `heading-${index}`,
          title: h2Match[1].replace(/#/g, '').trim(),
          level: 2
        });
      } else if (h3Match) {
        extractedHeadings.push({
          id: `heading-${index}`,
          title: h3Match[1].replace(/#/g, '').trim(),
          level: 3
        });
      }
    });

    setHeadings(extractedHeadings);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveHeading(heading.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`sticky top-24 w-64 max-h-[calc(100vh-6rem)] ${className}`}
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white">Table of Contents</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white transition-colors md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <nav className="p-4 max-h-96 overflow-y-auto">
                <ul className="space-y-1">
                  {headings.map((heading) => (
                    <motion.li
                      key={heading.id}
                      whileHover={{ x: 4 }}
                      className="group"
                    >
                      <button
                        onClick={() => scrollToHeading(heading.id)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                          activeHeading === heading.id
                            ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                        style={{ paddingLeft: `${(heading.level - 2) * 12 + 12}px` }}
                      >
                        <ChevronRight
                          className={`w-3 h-3 transition-transform ${
                            activeHeading === heading.id ? 'rotate-90' : ''
                          }`}
                        />
                        <span className="text-sm">{heading.title}</span>
                      </button>
                    </motion.li>
                  ))}
                </ul>

                {/* Progress Indicator */}
                {headings.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Reading Progress</span>
                      <span>
                        {Math.max(
                          0,
                          Math.round(
                            (headings.findIndex(h => h.id === activeHeading) + 1) /
                              headings.length *
                              100
                          )
                        )}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            0,
                            (headings.findIndex(h => h.id === activeHeading) + 1) /
                              headings.length *
                              100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Toggle */}
        <div className="md:hidden border-t border-slate-700 p-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} Table of Contents
          </button>
        </div>
      </div>
    </motion.aside>
  );
};