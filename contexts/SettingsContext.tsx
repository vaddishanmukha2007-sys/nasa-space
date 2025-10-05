import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'light';
export type OrbitalPeriodUnit = 'days' | 'years';
export type PlanetaryRadiusUnit = 'earth' | 'jupiter';
export type StellarTemperatureUnit = 'kelvin' | 'celsius';

export interface UnitPreferences {
  orbitalPeriod: OrbitalPeriodUnit;
  planetaryRadius: PlanetaryRadiusUnit;
  stellarTemperature: StellarTemperatureUnit;
}

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  units: UnitPreferences;
  setUnits: (units: UnitPreferences) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultUnits: UnitPreferences = {
    orbitalPeriod: 'days',
    planetaryRadius: 'earth',
    stellarTemperature: 'kelvin',
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
        return savedTheme;
    }
    // Default to user's system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [units, setUnitsState] = useState<UnitPreferences>(() => {
    try {
        const savedUnits = localStorage.getItem('units');
        return savedUnits ? JSON.parse(savedUnits) : defaultUnits;
    } catch {
        return defaultUnits;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  const setUnits = (newUnits: UnitPreferences) => {
    setUnitsState(newUnits);
    localStorage.setItem('units', JSON.stringify(newUnits));
  };

  return (
    <SettingsContext.Provider value={{ theme, setTheme, units, setUnits }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};