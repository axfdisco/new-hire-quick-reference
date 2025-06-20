
import React from 'react';
import { LinkCardProps } from '../types';

export const LinkCard: React.FC<LinkCardProps> = ({ title, description, href, icon, ctaText = "Learn More" }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-6 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-700/90 border border-white/20 rounded-xl shadow-xl 
                 transform transition-all duration-300 ease-in-out group 
                 hover:shadow-2xl hover:shadow-sky-400/40 hover:-translate-y-1.5 
                 hover:border-sky-400 
                 hover:from-slate-700/95 hover:via-slate-600/90 hover:to-slate-500/85"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 text-sky-400 group-hover:text-sky-200 group-hover:scale-110 transform transition-all duration-300 ease-in-out pt-1">
          {icon}
        </div>
        <div className="flex-1">
          <h5 className="mb-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-100 transition-all duration-300 ease-in-out">{title}</h5>
          <p className="font-normal text-slate-300 mb-4 text-sm sm:text-base">{description}</p>
          <span className="inline-flex items-center text-sky-400 group-hover:text-sky-100 font-semibold transition-colors duration-200 text-sm sm:text-base">
            {ctaText}
            <svg className="w-4 h-4 ml-2 rtl:rotate-180 transform transition-transform duration-300 ease-in-out group-hover:translate-x-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
};
