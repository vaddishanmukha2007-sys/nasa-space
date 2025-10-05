import React from 'react';
import { UserIcon, SettingsIcon } from './Icons';
import Logo from './Logo';

interface HeaderProps {
    activeView: 'dashboard' | 'profile' | 'archive';
    setActiveView: (view: 'dashboard' | 'profile' | 'archive') => void;
    onOpenSettings: () => void;
}

const NavButton: React.FC<{title: string, isActive: boolean, onClick: () => void, icon?: React.ReactNode}> = ({ title, isActive, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center gap-2 ${
            isActive
                ? 'bg-amber-500/80 text-white shadow-md'
                : 'bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600/70'
        }`}
    >
        {icon}
        {title}
    </button>
);


const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onOpenSettings }) => {
  return (
    <header className="p-8 border-b border-amber-500/20">
        <div className="flex justify-between items-center flex-wrap gap-y-4">
            <div className="flex-shrink-0">
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center">
                    <Logo className="h-10 w-10 inline-block mr-3" />
                    <span>Exoplanet Detector</span>
                </h1>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4">
                <NavButton title="Dashboard" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                <NavButton 
                    title="Profile & History" 
                    isActive={activeView === 'profile'} 
                    onClick={() => setActiveView('profile')}
                    icon={<UserIcon className="w-4 h-4" />}
                />
                <NavButton 
                    title="Yearly Archive" 
                    isActive={activeView === 'archive'} 
                    onClick={() => setActiveView('archive')}
                />
                 <button
                    onClick={onOpenSettings}
                    aria-label="Open settings"
                    className="p-2 rounded-md bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600/70 transition-colors duration-300"
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </nav>
        </div>
      <p className="text-slate-600 dark:text-gray-400 max-w-3xl mt-4 text-center md:text-left">
        Leveraging AI to analyze transit data from NASA's Kepler, K2, and TESS missions. Upload data or input parameters to classify potential exoplanets.
      </p>
    </header>
  );
};

export default Header;