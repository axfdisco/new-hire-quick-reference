
import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import ProrateCalculatorPage from './pages/ProrateCalculatorPage';
import MicrolearningPage from './pages/MicrolearningPage'; // Import the new page
import { NavButton } from './components/NavButton';

export type Page = 'home' | 'calculator' | 'microlearning'; // Add 'microlearning'

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const headerIcon = (
    <svg className="w-12 h-12 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      {currentPage === 'home' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      ) : currentPage === 'calculator' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zM3 8.25v10.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V8.25M3 8.25V6A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 6v2.25m0 0l-5.25 5.25M3 8.25l5.25 5.25m0 0l5.25-5.25m-5.25 5.25V3" />
      ) : ( // Microlearning icon (lightbulb)
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      )}
    </svg>
  );

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home': return 'New Hire Quick Links';
      case 'calculator': return 'Prorate Calculator';
      case 'microlearning': return 'Contract Admin Microlearning';
      default: return 'Quick Reference App';
    }
  };

  const getPageSubtitle = () => {
    switch (currentPage) {
      case 'home': return 'Your essential resources for communication, process documentation, and helpful tools.';
      case 'calculator': return 'Calculate prorated subscription amounts based on calendar month cycles.';
      case 'microlearning': return 'Key processes and knowledge for Contract Administrators.';
      default: return '';
    }
  };
  
  const getFooterText = () => {
    switch (currentPage) {
        case 'home': return 'Empowering new hires for success.';
        case 'calculator': return 'Making calculations simple.';
        case 'microlearning': return 'Continuous learning for contract mastery.';
        default: return '';
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center selection:bg-sky-500 selection:text-white">
      <header className="mb-10 sm:mb-12 text-center w-full max-w-4xl">
        <div className="inline-block p-3 mb-4 bg-white/10 rounded-full shadow-md">
           {headerIcon}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300">
          {getPageTitle()}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
          {getPageSubtitle()}
        </p>
        <nav className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4" aria-label="Main navigation">
          <NavButton onClick={() => setCurrentPage('home')} isActive={currentPage === 'home'}>
            Quick Links
          </NavButton>
          <NavButton onClick={() => setCurrentPage('calculator')} isActive={currentPage === 'calculator'}>
            Prorate Calculator
          </NavButton>
          <NavButton onClick={() => setCurrentPage('microlearning')} isActive={currentPage === 'microlearning'}>
            Microlearning
          </NavButton>
        </nav>
      </header>

      <div className="w-full flex-grow flex flex-col items-center">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'calculator' && <ProrateCalculatorPage />}
        {currentPage === 'microlearning' && <MicrolearningPage />}
      </div>

      <footer className="mt-16 sm:mt-20 text-center w-full max-w-4xl">
        <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} Vendasta. All rights reserved.</p>
        <p className="text-xs text-slate-500 mt-1">
          {getFooterText()}
        </p>
      </footer>
    </div>
  );
};
export default App;
