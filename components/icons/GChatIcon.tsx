import React from 'react';

export const GChatIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.068.014.135.027.204.04v6.018a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V8.511c.068-.014.135-.027.204-.04C5.124 8.364 5 8.182 5 8.006V7.5a2.25 2.25 0 012.25-2.25h10.5a2.25 2.25 0 012.25 2.25v.506c0 .176-.124.358-.326.47zm-11.03 4.5A.75.75 0 008.25 12H9a.75.75 0 000 1.5h-.75a.75.75 0 00-.97.724m5.25 0a.75.75 0 00-.97-.724H12a.75.75 0 000 1.5h.28a.75.75 0 00.97-.724M7.5 10.5a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" />
  </svg>
);