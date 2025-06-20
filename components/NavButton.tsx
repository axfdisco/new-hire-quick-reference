import React from 'react';

interface NavButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}

export const NavButton: React.FC<NavButtonProps> = ({ onClick, isActive, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75
        ${isActive
          ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg transform scale-105'
          : 'bg-slate-700 hover:bg-slate-600 text-sky-300 hover:text-sky-200 shadow-md hover:shadow-lg'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </button>
  );
};