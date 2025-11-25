import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OrbitSystem } from './components/OrbitSystem';
import { ChatWidget } from './components/ChatWidget';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ExperiencePage from './pages/ExperiencePage';
import SkillsPage from './pages/SkillsPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
        </Routes>
        <ChatWidget />

        {/* Footer */}
        <footer className="fixed bottom-4 left-6 text-xs text-slate-700 pointer-events-none z-10">
          &copy; {new Date().getFullYear()} Sean O'Sullivan. Built with React & Gemini AI.
        </footer>
      </div>
    </Router>
  );
};

export default App;
