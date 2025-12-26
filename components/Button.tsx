import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "px-4 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-emerald-400"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};