import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Users,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import { EXPERIENCES, EDUCATION } from '../content';
import { sortExperienceByDate, formatDateRange, calculateDuration } from '../utils';

const ExperiencePage: React.FC = () => {
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'work' | 'education'>('work');

  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [timelineRef, timelineInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const sortedExperiences = sortExperienceByDate(EXPERIENCES);
  const sortedEducation = [...EDUCATION].sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const toggleExpand = (id: string) => {
    setExpandedExp(expandedExp === id ? null : id);
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const stats = {
    totalExperience: calculateDuration(sortedExperiences[sortedExperiences.length - 1]?.startDate || ''),
    companies: sortedExperiences.length,
    projects: 25,
    technologies: new Set(sortedExperiences.flatMap(exp => exp.technologies)).size
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            My Experience
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            A comprehensive overview of my professional journey, showcasing key achievements,
            technical expertise, and the impact I've made across different organizations.
          </motion.p>

          {/* Tab Navigation */}
          <motion.div
            variants={itemVariants}
            className="inline-flex rounded-lg bg-slate-800 p-1"
          >
            <button
              onClick={() => setSelectedTab('work')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                selectedTab === 'work'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Work Experience
            </button>
            <button
              onClick={() => setSelectedTab('education')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                selectedTab === 'education'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Education
            </button>
          </motion.div>
        </motion.div>

        {/* Statistics */}
        {selectedTab === 'work' && (
          <motion.section
            ref={statsRef}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="mb-16"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-slate-800 rounded-xl p-6 text-center"
              >
                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stats.totalExperience}
                </div>
                <div className="text-gray-400 text-sm">Total Experience</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-slate-800 rounded-xl p-6 text-center"
              >
                <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stats.companies}
                </div>
                <div className="text-gray-400 text-sm">Companies</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-slate-800 rounded-xl p-6 text-center"
              >
                <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stats.projects}+
                </div>
                <div className="text-gray-400 text-sm">Projects Delivered</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-slate-800 rounded-xl p-6 text-center"
              >
                <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stats.technologies}
                </div>
                <div className="text-gray-400 text-sm">Technologies</div>
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Experience Timeline */}
        <motion.section
          ref={timelineRef}
          initial="hidden"
          animate={timelineInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />

            <div className="space-y-8">
              {(selectedTab === 'work' ? sortedExperiences : sortedEducation).map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-950 z-10">
                    {selectedTab === 'work' && (
                      <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-20" />
                    )}
                  </div>

                  {/* Content Card */}
                  <div className={`ml-16 md:ml-0 md:w-5/12 ${
                    index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'
                  }`}>
                    <div className="bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                      {/* Header */}
                      <div className={`flex items-start justify-between mb-4 ${
                        index % 2 === 0 ? 'md:flex-row-reverse' : ''
                      }`}>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {(item as any).position || (item as any).degree}
                          </h3>
                          <p className="text-blue-400 mb-2">
                            {(item as any).company || (item as any).institution}
                          </p>
                          <div className={`flex items-center gap-2 text-sm text-gray-400 ${
                            index % 2 === 0 ? 'md:flex-row-reverse' : ''
                          }`}>
                            <MapPin className="w-4 h-4" />
                            {(item as any).location}
                          </div>
                        </div>

                        {(item as any).url && (
                          <a
                            href={(item as any).url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Duration */}
                      <div className={`flex items-center gap-2 mb-4 text-sm ${
                        index % 2 === 0 ? 'md:flex-row-reverse' : ''
                      }`}>
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">
                          {formatDateRange((item as any).startDate, (item as any).endDate)}
                        </span>
                        {(item as any).current && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                            Current
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 mb-4">
                        {(item as any).description}
                      </p>

                      {/* Key Achievements */}
                      {(selectedTab === 'work' && (item as any).achievements.length > 0) && (
                        <div className="mb-4">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className={`flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors ${
                              index % 2 === 0 ? 'md:flex-row-reverse ml-auto' : ''
                            }`}
                          >
                            <span className="text-sm font-medium">Key Achievements</span>
                            {expandedExp === item.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          {expandedExp === item.id && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-3 space-y-2"
                            >
                              {(item as any).achievements.map((achievement: string, i: number) => (
                                <li
                                  key={i}
                                  className={`flex items-start gap-2 text-sm text-gray-400 ${
                                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                  }`}
                                >
                                  <span className="text-green-400 mt-1 flex-shrink-0">•</span>
                                  {achievement}
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </div>
                      )}

                      {/* Technologies */}
                      {selectedTab === 'work' && (item as any).technologies.length > 0 && (
                        <div className={`flex flex-wrap gap-2 ${
                          index % 2 === 0 ? 'md:flex-row-reverse' : ''
                        }`}>
                          {(item as any).technologies.slice(0, 6).map((tech: string, i: number) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                          {(item as any).technologies.length > 6 && (
                            <span className="px-3 py-1 bg-slate-700 text-gray-400 rounded-full text-xs">
                              +{(item as any).technologies.length - 6} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Education specific */}
                      {selectedTab === 'education' && (item as any).gpa && (
                        <div className="mt-4 text-sm text-gray-400">
                          <span className="font-medium">GPA:</span> {(item as any).gpa}
                        </div>
                      )}

                      {selectedTab === 'education' && (item as any).achievements && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-white mb-2">Achievements</h4>
                          <ul className="space-y-1">
                            {(item as any).achievements.map((achievement: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                <span className="text-green-400 mt-1">•</span>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Skills Highlight */}
        {selectedTab === 'work' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Bring Value to Your Team
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                With experience across multiple industries and technologies, I bring a unique perspective
                to solving complex technical challenges. Let's discuss how I can contribute to your projects.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  View Projects
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Get In Touch
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default ExperiencePage;