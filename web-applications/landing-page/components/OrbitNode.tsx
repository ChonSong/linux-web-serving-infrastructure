import React from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';
import { Cpu, Code, Globe, Smartphone, Database, Zap } from 'lucide-react';

interface OrbitNodeProps {
  project: Project;
  x: number;
  y: number;
  onHover: (id: string | null) => void;
  isHovered: boolean;
  isAnyHovered: boolean;
}

const iconMap = {
  Cpu,
  Code,
  Globe,
  Smartphone,
  Database,
  Zap,
};

export const OrbitNode: React.FC<OrbitNodeProps> = ({ project, x, y, onHover, isHovered, isAnyHovered }) => {
  const Icon = iconMap[project.iconName];

  const handleClick = () => {
    if (project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 flex items-center justify-center cursor-pointer"
      style={{
        x,
        y,
        // We offset by -50% to center the element on the coordinate
        marginLeft: -32, // w-16 is 64px, half is 32
        marginTop: -32,
        zIndex: isHovered ? 50 : 10,
      }}
      // If any node is hovered, fade others out slightly. If this one is hovered, scale up.
      animate={{
        scale: isHovered ? 1.3 : isAnyHovered ? 0.8 : 1,
        opacity: isAnyHovered && !isHovered ? 0.4 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={() => onHover(project.id)}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
    >
      <div 
        className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border border-white/10 backdrop-blur-md transition-colors duration-300"
        style={{ 
          backgroundColor: isHovered ? project.color : 'rgba(15, 23, 42, 0.8)', // slate-900 with opacity
          borderColor: isHovered ? project.color : 'rgba(255,255,255,0.1)',
          boxShadow: isHovered ? `0 0 20px ${project.color}` : 'none'
        }}
      >
        <Icon className={`w-6 h-6 ${isHovered ? 'text-white' : 'text-slate-300'}`} />
        
        {/* Tooltip Label */}
        <motion.div
          className="absolute top-full mt-3 px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-md whitespace-nowrap pointer-events-none border border-slate-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -10 }}
        >
          {project.title}
        </motion.div>
      </div>
    </motion.div>
  );
};
