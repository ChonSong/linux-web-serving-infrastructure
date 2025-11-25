import React from 'react';
import { motion } from 'framer-motion';
import { AVATAR_URL } from '../constants';

export const CentralAvatar: React.FC = () => {
  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
    >
      <div className="relative group cursor-default">
        {/* Pulsing Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition duration-1000 animate-pulse" />
        
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl">
          <img 
            src={AVATAR_URL} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center w-64">
           <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Sean O'Sullivan</h1>
           <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Senior Frontend Engineer</p>
        </div>
      </div>
    </motion.div>
  );
};
