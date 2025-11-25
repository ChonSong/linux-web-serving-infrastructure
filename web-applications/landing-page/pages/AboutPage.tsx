import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  Target,
  Code,
  Heart,
  Lightbulb,
  Users
} from 'lucide-react';
import { PERSONAL_INFO, EDUCATION, EXPERIENCES, getTotalExperience, SITE_METADATA } from '../content';
import { formatDate, formatDateRange } from '../utils';
import { SEO } from '../components/SEO';

const AboutPage: React.FC = () => {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [storyRef, storyInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [timelineRef, timelineInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [valuesRef, valuesInView] = useInView({ triggerOnce: true, threshold: 0.1 });

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

  const coreValues = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Technical Excellence",
      description: "Writing clean, efficient, and maintainable code that follows industry best practices."
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Innovation",
      description: "Continuously exploring new technologies and approaches to solve complex problems."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaboration",
      description: "Working effectively with teams and stakeholders to achieve common goals."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "User-Centered",
      description: "Building solutions that prioritize user experience and deliver real value."
    }
  ];

  const timelineEvents = [
    ...EDUCATION.map(edu => ({
      type: 'education',
      date: edu.startDate,
      title: edu.degree,
      subtitle: edu.institution,
      description: `Studied ${edu.field} with a ${edu.gpa} GPA`,
      achievements: edu.achievements || []
    })),
    ...EXPERIENCES.map(exp => ({
      type: 'experience',
      date: exp.startDate,
      title: exp.position,
      subtitle: exp.company,
      description: exp.description,
      achievements: exp.achievements.slice(0, 2), // Show first 2 achievements
      current: exp.current
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <SEO
      title="About Me"
      description={`${PERSONAL_INFO.bio} Senior Full-Stack Developer with ${getTotalExperience(EXPERIENCES)} of experience building scalable web applications.`}
      keywords={['About Sean O\'Sullivan', 'Full-Stack Developer', 'React Developer', 'Node.js Developer', 'San Francisco Developer', ...SITE_METADATA.keywords]}
      canonical="/about"
    >
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
            About Me
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8"
          >
            <div className="relative">
              <img
                src={PERSONAL_INFO.avatar}
                alt={PERSONAL_INFO.name}
                className="w-40 h-40 rounded-full border-4 border-blue-500 shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="text-left max-w-2xl">
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-bold text-white mb-2"
              >
                {PERSONAL_INFO.name}
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-xl text-blue-400 mb-4"
              >
                {PERSONAL_INFO.title}
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-gray-300 mb-6"
              >
                {PERSONAL_INFO.tagline}
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4 text-sm text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {PERSONAL_INFO.location}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {PERSONAL_INFO.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {PERSONAL_INFO.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {getTotalExperience(EXPERIENCES)} Experience
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="max-w-3xl mx-auto text-lg text-gray-300 leading-relaxed"
          >
            {PERSONAL_INFO.bio}
          </motion.p>
        </motion.div>

        {/* Professional Story */}
        <motion.section
          ref={storyRef}
          initial="hidden"
          animate={storyInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-white mb-8 text-center"
          >
            My Professional Journey
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              variants={itemVariants}
              className="bg-slate-800 rounded-xl p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Current Focus</h3>
              </div>
              <p className="text-gray-300">
                Currently leading development of enterprise-scale applications at TechCorp Solutions,
                focusing on microservices architecture, real-time analytics, and AI integration.
                Passionate about building scalable solutions that handle millions of users while maintaining
                exceptional performance and reliability.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-800 rounded-xl p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Key Achievements</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  Led migration affecting 1M+ users
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  Reduced application load time by 60%
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  Mentored team of 5+ developers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  Open source contributor with 2.5k+ stars
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.section>

        {/* Timeline */}
        <motion.section
          ref={timelineRef}
          initial="hidden"
          animate={timelineInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-white mb-8 text-center"
          >
            Career Timeline
          </motion.h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />

            <div className="space-y-8">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-950 z-10" />

                  {/* Content */}
                  <div className={`ml-16 md:ml-0 md:w-5/12 ${
                    index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'
                  }`}>
                    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
                      <div className={`flex items-center gap-2 mb-2 ${
                        index % 2 === 0 ? 'md:flex-row-reverse' : ''
                      }`}>
                        <div className={`p-2 rounded-lg ${
                          event.type === 'education' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {event.type === 'education' ? (
                            <Award className="w-4 h-4 text-white" />
                          ) : (
                            <Target className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatDate(event.date)}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-1">
                        {event.title}
                      </h3>
                      <p className="text-blue-400 mb-2">{event.subtitle}</p>
                      <p className="text-gray-300 mb-3">{event.description}</p>

                      {event.achievements.length > 0 && (
                        <ul className="text-sm text-gray-400 space-y-1">
                          {event.achievements.slice(0, 2).map((achievement, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-400">•</span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Core Values */}
        <motion.section
          ref={valuesRef}
          initial="hidden"
          animate={valuesInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-white mb-8 text-center"
          >
            Core Values & Philosophy
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-slate-800 rounded-xl p-6 text-center hover:bg-slate-700 transition-colors"
              >
                <div className="flex justify-center mb-4 text-blue-400">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Let's Work Together
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              I'm always interested in exciting projects and collaboration opportunities.
              Whether you need a full-stack developer, technical consultant, or have an innovative idea,
              I'd love to hear from you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get In Touch
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                View Projects
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </SEO>
  );
};

export { AboutPage };
export default AboutPage;