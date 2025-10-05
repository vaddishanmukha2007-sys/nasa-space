import React from 'react';
import { useSettings, UnitPreferences } from '../contexts/SettingsContext';
import { SunIcon, MoonIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme, units, setUnits } = useSettings();

    if (!isOpen) return null;

    const handleUnitChange = (category: keyof UnitPreferences, value: string) => {
        setUnits({ ...units, [category]: value });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
        >
            <div 
                className="bg-slate-100 dark:bg-slate-800 border border-amber-500/20 rounded-lg shadow-2xl w-full max-w-md text-slate-800 dark:text-gray-200 animate-slide-up-fast"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-300 dark:border-slate-700">
                    <h2 id="settings-title" className="text-xl font-bold text-amber-500 dark:text-amber-400">Settings</h2>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Close settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {/* Theme Settings */}
                    <div>
                        <h3 className="font-semibold mb-2">Theme</h3>
                        <div className="flex gap-2 p-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg">
                            <ThemeButton title="Light" icon={<SunIcon className="w-5 h-5"/>} isActive={theme === 'light'} onClick={() => setTheme('light')} />
                            <ThemeButton title="Dark" icon={<MoonIcon className="w-5 h-5"/>} isActive={theme === 'dark'} onClick={() => setTheme('dark')} />
                        </div>
                    </div>

                    {/* Unit Settings */}
                    <div>
                        <h3 className="font-semibold mb-3">Unit Preferences</h3>
                        <div className="space-y-4">
                            <UnitSelector
                                label="Orbital Period"
                                options={[{value: 'days', label: 'Days'}, {value: 'years', label: 'Years'}]}
                                selected={units.orbitalPeriod}
                                onChange={(value) => handleUnitChange('orbitalPeriod', value)}
                            />
                             <UnitSelector
                                label="Planetary Radius"
                                options={[{value: 'earth', label: 'Earth Radii (R⊕)'}, {value: 'jupiter', label: 'Jupiter Radii (RJ)'}]}
                                selected={units.planetaryRadius}
                                onChange={(value) => handleUnitChange('planetaryRadius', value)}
                            />
                             <UnitSelector
                                label="Stellar Temperature"
                                options={[{value: 'kelvin', label: 'Kelvin (K)'}, {value: 'celsius', label: 'Celsius (°C)'}]}
                                selected={units.stellarTemperature}
                                onChange={(value) => handleUnitChange('stellarTemperature', value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper components for the modal
const ThemeButton: React.FC<{title: string, isActive: boolean, onClick: () => void, icon: React.ReactNode}> = ({ title, isActive, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
            isActive
                ? 'bg-white dark:bg-amber-500/80 text-slate-900 dark:text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-slate-600/70'
        }`}
    >
        {icon}
        {title}
    </button>
);

const UnitSelector: React.FC<{
    label: string, 
    options: {value: string, label: string}[],
    selected: string,
    onChange: (value: string) => void,
}> = ({ label, options, selected, onChange }) => (
    <div className="flex justify-between items-center">
        <label className="text-sm">{label}</label>
        <div className="flex gap-1 p-0.5 bg-slate-200 dark:bg-slate-700/50 rounded-lg text-xs">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-1 rounded-md transition-colors duration-300 ${
                        selected === opt.value
                            ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-slate-600/50'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export default SettingsModal;