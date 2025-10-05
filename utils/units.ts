import { UnitPreferences, OrbitalPeriodUnit, PlanetaryRadiusUnit, StellarTemperatureUnit } from '../contexts/SettingsContext';

// Conversion Constants
const DAYS_IN_YEAR = 365.25;
const EARTH_RADII_IN_JUPITER_RADIUS = 11.209;
const KELVIN_CELSIUS_OFFSET = 273.15;

// --- Conversion TO display units ---
export const convertToDisplayValue = (
    value: number, 
    unit: OrbitalPeriodUnit | PlanetaryRadiusUnit | StellarTemperatureUnit
): number => {
    switch(unit) {
        case 'years':
            return value / DAYS_IN_YEAR;
        case 'jupiter':
            return value / EARTH_RADII_IN_JUPITER_RADIUS;
        case 'celsius':
            return value - KELVIN_CELSIUS_OFFSET;
        case 'days':
        case 'earth':
        case 'kelvin':
        default:
            return value;
    }
};

// --- Conversion FROM display units ---
export const convertFromDisplayValue = (
    value: number, 
    unit: OrbitalPeriodUnit | PlanetaryRadiusUnit | StellarTemperatureUnit
): number => {
    switch(unit) {
        case 'years':
            return value * DAYS_IN_YEAR;
        case 'jupiter':
            return value * EARTH_RADII_IN_JUPITER_RADIUS;
        case 'celsius':
            return value + KELVIN_CELSIUS_OFFSET;
        case 'days':
        case 'earth':
        case 'kelvin':
        default:
            return value;
    }
};

export const getUnitConfig = (units: UnitPreferences) => ({
    orbitalPeriod: { 
        label: units.orbitalPeriod === 'days' ? 'days' : 'years',
        min: convertToDisplayValue(0.1, units.orbitalPeriod),
        max: convertToDisplayValue(10000, units.orbitalPeriod),
        step: units.orbitalPeriod === 'days' ? 0.1 : 0.01,
    },
    transitDuration: {
        label: 'hours',
        min: 0.1,
        max: 24,
        step: 0.1,
    },
    planetaryRadius: {
        label: units.planetaryRadius === 'earth' ? 'Earth radii' : 'Jupiter radii',
        min: convertToDisplayValue(0.1, units.planetaryRadius),
        max: convertToDisplayValue(20, units.planetaryRadius),
        step: units.planetaryRadius === 'earth' ? 0.01 : 0.001,
    },
    stellarTemperature: {
        label: units.stellarTemperature === 'kelvin' ? 'K' : '°C',
        min: convertToDisplayValue(2000, units.stellarTemperature),
        max: convertToDisplayValue(10000, units.stellarTemperature),
        step: units.stellarTemperature === 'kelvin' ? 10 : 1,
    }
});