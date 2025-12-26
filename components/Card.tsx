import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 ${onClick ? 'cursor-pointer hover:bg-slate-800 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
};