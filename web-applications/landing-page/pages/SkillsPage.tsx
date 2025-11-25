import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Code,
  Database,
  Cloud,
  Smartphone,
  Palette,
  Cpu,
  Star,
  TrendingUp,
  Award,
  Filter,
  Search,
  Zap
} from 'lucide-react';
import { SKILLS, SKILL_CATEGORIES, SITE_METADATA } from '../content';
import { getProficiencyLevel, groupSkillsByCategory, getTopSkills } from '../utils';
import { SEO } from '../components/SEO';

const SkillsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'proficiency' | 'experience' | 'name'>('proficiency');

  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [overviewRef, overviewInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [skillsRef, skillsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

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

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(SKILLS.map(skill => skill.category));
    return ['all', ...Array.from(cats)];
  }, []);

  // Filter and sort skills
  const filteredAndSortedSkills = useMemo(() => {
    let filtered = SKILLS;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort skills
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'proficiency':
          return b.proficiency - a.proficiency;
        case 'experience':
          return b.yearsExperience - a.yearsExperience;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [selectedCategory, searchTerm, sortBy]);

  // Skill statistics
  const skillStats = useMemo(() => {
    const totalSkills = SKILLS.length;
    const expertSkills = SKILLS.filter(s => s.proficiency === 5).length;
    const totalExperience = Math.max(...SKILLS.map(s => s.yearsExperience));
    const categoriesCount = new Set(SKILLS.map(s => s.category)).size;

    return {
      totalSkills,
      expertSkills,
      totalExperience,
      categoriesCount
    };
  }, []);

  // Category icons
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      frontend: <Code className="w-5 h-5" />,
      backend: <Database className="w-5 h-5" />,
      devops: <Cloud className="w-5 h-5" />,
      mobile: <Smartphone className="w-5 h-5" />,
      design: <Palette className="w-5 h-5" />,
      other: <Cpu className="w-5 h-5" />
    };
    return icons[category] || icons.other;
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
            Technical Skills
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            A comprehensive overview of my technical expertise, spanning across multiple
            domains and technologies. Each skill is rated by proficiency level and years of hands-on experience.
          </motion.p>
        </motion.div>

        {/* Skills Overview */}
        <motion.section
          ref={overviewRef}
          initial="hidden"
          animate={overviewInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              variants={itemVariants}
              className="bg-slate-800 rounded-xl p-6 text-center"
            >
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {skillStats.totalSkills}
              </div>
              <div className="text-gray-400 text-sm">Total Skills</div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-800 rounded-xl p-6 text-center"
            >
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {skillStats.expertSkills}
              </div>
              <div className="text-gray-400 text-sm">Expert Level</div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-800 rounded-xl p-6 text-center"
            >
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {skillStats.totalExperience}+
              </div>
              <div className="text-gray-400 text-sm">Years Experience</div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-800 rounded-xl p-6 text-center"
            >
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {skillStats.categoriesCount}
              </div>
              <div className="text-gray-400 text-sm">Categories</div>
            </motion.div>
          </div>
        </motion.section>

        {/* Filters and Search */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="proficiency">Sort by Proficiency</option>
                <option value="experience">Sort by Experience</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Skills Display */}
        <motion.section
          ref={skillsRef}
          initial="hidden"
          animate={skillsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Category Sections */}
          {selectedCategory === 'all' ? (
            // Show skills by categories
            SKILL_CATEGORIES.map((category, catIndex) => (
              <motion.div
                key={category.name}
                variants={itemVariants}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500 p-3 rounded-lg text-white">
                    {getCategoryIcon(category.name.toLowerCase())}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                  <span className="text-gray-400">({category.skills.length} skills)</span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.skills
                    .filter(skill =>
                      !searchTerm || skill.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .sort((a, b) => b.proficiency - a.proficiency)
                    .map((skill) => (
                      <SkillCard key={skill.id} skill={skill} />
                    ))}
                </div>
              </motion.div>
            ))
          ) : (
            // Show filtered skills
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          )}

          {filteredAndSortedSkills.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No skills found matching your criteria.
              </p>
            </div>
          )}
        </motion.section>

        {/* Top Skills Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Top Expertise Areas</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Most Proficient</h4>
                {getTopSkills(SKILLS, 5).map((skill, index) => (
                  <div key={skill.id} className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{skill.name}</span>
                        <span className="text-white/80 text-sm">Level {skill.proficiency}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2"
                          style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Most Experienced</h4>
                {[...SKILLS]
                  .sort((a, b) => b.yearsExperience - a.yearsExperience)
                  .slice(0, 5)
                  .map((skill, index) => (
                    <div key={skill.id} className="flex items-center gap-3 mb-3">
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium">{skill.name}</span>
                          <span className="text-white/80 text-sm">{skill.yearsExperience} years</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 w-6 rounded-full ${
                                i < skill.proficiency ? 'bg-white' : 'bg-white/20'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

// Skill Card Component
const SkillCard: React.FC<{ skill: any }> = ({ skill }) => {
  const [isHovered, setIsHovered] = useState(false);
  const proficiencyLevel = getProficiencyLevel(skill.proficiency);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${proficiencyLevel.color.replace('bg-', 'text-').replace('500', '400')}`}>
          {proficiencyLevel.label}
        </span>
      </div>

      {/* Proficiency Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Proficiency</span>
          <span className="text-sm text-white">{skill.proficiency}/5</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${proficiencyLevel.percentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`h-2 rounded-full ${proficiencyLevel.color}`}
          />
        </div>
      </div>

      {/* Experience */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <Zap className="w-4 h-4" />
        <span>{skill.yearsExperience} years experience</span>
      </div>

      {/* Projects */}
      {skill.projects && skill.projects.length > 0 && (
        <div className="mb-3">
          <span className="text-sm text-gray-400">Used in:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {skill.projects.slice(0, 2).map((project: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-slate-700 text-gray-300 rounded text-xs"
              >
                {project}
              </span>
            ))}
            {skill.projects.length > 2 && (
              <span className="px-2 py-1 bg-slate-700 text-gray-400 rounded text-xs">
                +{skill.projects.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Certifications */}
      {skill.certifications && skill.certifications.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-blue-400">
          <Award className="w-3 h-3" />
          <span>{skill.certifications.length} certification{skill.certifications.length > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Hover Details */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-slate-700"
        >
          <p className="text-xs text-gray-400">
            Proficiency Level: {proficiencyLevel.label} ({proficiencyLevel.percentage}%)
          </p>
          {skill.certifications && (
            <div className="mt-2">
              <span className="text-xs text-gray-400">Certifications:</span>
              <ul className="mt-1 space-y-1">
                {skill.certifications.map((cert: string, i: number) => (
                  <li key={i} className="text-xs text-blue-400">• {cert}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SkillsPage;