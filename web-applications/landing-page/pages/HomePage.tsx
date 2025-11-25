import React from 'react';
import { OrbitSystem } from '../components/OrbitSystem';

export const HomePage: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen">
      <OrbitSystem />
    </div>
  );
};