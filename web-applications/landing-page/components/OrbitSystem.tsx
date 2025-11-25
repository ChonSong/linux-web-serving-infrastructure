import React, { useState, useEffect, useRef } from 'react';
import { PROJECTS } from '../constants';
import { OrbitNode } from './OrbitNode';
import { CentralAvatar } from './CentralAvatar';
import { motion, AnimatePresence } from 'framer-motion';

export const OrbitSystem: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const isHoveringAny = hoveredId !== null;

  // Animation Loop
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      
      // Rotate slowly. Pause if hovering any project.
      if (!isHoveringAny) {
        setRotation((prev) => (prev + deltaTime * 0.005) % 360);
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isHoveringAny]); // Re-bind when hover state changes to ensure logic updates

  // Calculate radius based on screen size
  const [radius, setRadius] = useState(240);

  useEffect(() => {
    const updateRadius = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) setRadius(150); // mobile
        else if (width < 768) setRadius(190); // sm
        else if (width < 1024) setRadius(220); // md
        else setRadius(280); // lg and up
      }
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // Find details for overlay
  const activeProject = PROJECTS.find(p => p.id === hoveredId);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      
      {/* Background Starfield */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 3 + 2 + 's'
            }}
          />
        ))}
        {/* Ambient Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Orbit Container */}
      <div className="relative w-full max-w-[600px] h-full max-h-[600px] md:max-w-[800px] md:max-h-[800px] aspect-square flex-shrink-0">

        {/* Orbit Track Ring (Visual) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
          style={{ width: radius * 2, height: radius * 2 }}
        />
        
        <CentralAvatar />

        {PROJECTS.map((project, index) => {
          // Calculate Angle
          const angleStep = 360 / PROJECTS.length;
          const theta = (angleStep * index + rotation) * (Math.PI / 180); // Convert to radians
          
          const x = radius * Math.cos(theta);
          const y = radius * Math.sin(theta);

          return (
            <OrbitNode
              key={project.id}
              project={project}
              x={x}
              y={y}
              onHover={setHoveredId}
              isHovered={hoveredId === project.id}
              isAnyHovered={isHoveringAny}
            />
          );
        })}
      </div>

      {/* Info Overlay (Bottom) */}
      <AnimatePresence>
        {activeProject && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-12 left-0 right-0 mx-auto max-w-md p-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-40 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-2" style={{ color: activeProject.color }}>
              {activeProject.title}
            </h3>
            <p className="text-slate-300 mb-4 leading-relaxed">
              {activeProject.description}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {activeProject.techStack.map((tech) => (
                <span key={tech} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex justify-center gap-3">
              {activeProject.url && (
                <button
                  onClick={() => window.open(activeProject.url, '_blank', 'noopener,noreferrer')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors border border-slate-700"
                >
                  View Live
                </button>
              )}
              {activeProject.githubUrl && (
                <button
                  onClick={() => window.open(activeProject.githubUrl, '_blank', 'noopener,noreferrer')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors border border-slate-700"
                >
                  View Code
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};