import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
// Fix: Import ClassificationResult as a value for enum access, and LightCurveDataPoint as a type.
import { ClassificationResult, type LightCurveDataPoint, type ExoplanetData } from '../types';
import { CLASSIFICATION_DETAILS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { convertToDisplayValue } from '../utils/units';

interface ResultsPanelProps {
  isLoading: boolean;
  result: ClassificationResult;
  lightCurveData: LightCurveDataPoint[];
  error: string | null;
  crossReferenceResult: { name: string; fact: string } | null;
  data: ExoplanetData;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-amber-500 dark:border-amber-400"></div>
    <p className="mt-4 text-slate-600 dark:text-gray-300">Analyzing transit data...</p>
  </div>
);

const AlertIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4">
    <AlertIcon />
    <h3 className="mt-4 text-xl font-bold text-red-500 dark:text-red-400">Analysis Failed</h3>
    <p className="mt-2 text-slate-500 dark:text-gray-400 max-w-md">{message}</p>
  </div>
);

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const StarIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.05 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69L11.049 2.927z" />
    </svg>
);

const ParameterSummary: React.FC<{ data: ExoplanetData }> = ({ data }) => {
    const { units } = useSettings();

    const formattedData = {
        orbitalPeriod: {
            value: convertToDisplayValue(data.orbitalPeriod, units.orbitalPeriod).toFixed(2),
            unit: units.orbitalPeriod === 'days' ? 'days' : 'years',
        },
        transitDuration: {
            value: data.transitDuration.toFixed(2),
            unit: 'hours',
        },
        planetaryRadius: {
            value: convertToDisplayValue(data.planetaryRadius, units.planetaryRadius).toFixed(2),
            unit: units.planetaryRadius === 'earth' ? 'R⊕' : 'RJ',
        },
        stellarTemperature: {
            value: convertToDisplayValue(data.stellarTemperature, units.stellarTemperature).toFixed(0),
            unit: units.stellarTemperature === 'kelvin' ? 'K' : '°C',
        }
    };

    return (
        <div className="mt-auto pt-4 border-t border-slate-300 dark:border-slate-700">
            <h4 className="text-base font-semibold text-slate-700 dark:text-gray-300 mb-2">Input Parameters</h4>
            <ul className="text-sm space-y-1 font-mono text-slate-500 dark:text-gray-400">
                <li>Period: <span className="font-semibold text-amber-600 dark:text-amber-400">{formattedData.orbitalPeriod.value} {formattedData.orbitalPeriod.unit}</span></li>
                <li>Duration: <span className="font-semibold text-amber-600 dark:text-amber-400">{formattedData.transitDuration.value} {formattedData.transitDuration.unit}</span></li>
                <li>Radius: <span className="font-semibold text-amber-600 dark:text-amber-400">{formattedData.planetaryRadius.value} {formattedData.planetaryRadius.unit}</span></li>
                <li>Star Temp: <span className="font-semibold text-amber-600 dark:text-amber-400">{formattedData.stellarTemperature.value} {formattedData.stellarTemperature.unit}</span></li>
            </ul>
        </div>
    );
};

const ResultsPanel: React.FC<ResultsPanelProps> = ({ isLoading, result, lightCurveData, error, crossReferenceResult, data }) => {
  const { theme } = useSettings();
  const resultDetails = CLASSIFICATION_DETAILS[result];
  const axisColor = theme === 'dark' ? '#9ca3af' : '#475569';

  const renderContent = () => {
    if (isLoading) {
        return <LoadingSpinner />;
    }
    if (error) {
        return <ErrorDisplay message={error} />;
    }
    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Top part with chart and classification */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3 flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-2">Classification</h3>
                    <div className={`px-4 py-2 text-center rounded-lg border text-xl font-bold ${resultDetails.color}`}>
                        {resultDetails.label}
                    </div>
                    <p className="text-slate-600 dark:text-gray-400 text-sm mt-4 flex-grow">
                        {resultDetails.description}
                    </p>
                    {result !== ClassificationResult.NONE && <ParameterSummary data={data} />}
                </div>
                <div className="lg:w-2/3 flex-grow flex flex-col min-h-[250px]">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-2">Simulated Light Curve</h3>
                    <div className="flex-grow w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lightCurveData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="time" stroke={axisColor} tick={{ fontSize: 12 }} label={{ value: 'Time (Hours)', position: 'insideBottom', offset: -5, fill: axisColor }} />
                                <YAxis stroke={axisColor} tick={{ fontSize: 12 }} domain={['dataMin - 0.001', 'dataMax + 0.001']} allowDataOverflow={true} label={{ value: 'Relative Flux', angle: -90, position: 'insideLeft', fill: axisColor }} />
                                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}` }} labelStyle={{ color: theme === 'dark' ? '#e5e7eb' : '#1e293b' }} />
                                <Line type="monotone" dataKey="flux" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            {/* New Cross-Reference Section */}
            {crossReferenceResult && (result === ClassificationResult.CONFIRMED_EXOPLANET || result === ClassificationResult.PLANETARY_CANDIDATE) && (
                <div className="border-t border-slate-300 dark:border-slate-700 pt-4">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-3">Database Cross-Reference</h3>
                    <div className={`flex items-start gap-4 p-4 rounded-lg border ${
                        crossReferenceResult.name === "Potentially New Discovery!" 
                        ? 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-500/50' 
                        : 'bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-500/50'
                    }`}>
                        {crossReferenceResult.name === "Potentially New Discovery!" ? (
                            <StarIcon className="w-8 h-8 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-1" />
                        ) : (
                            <CheckIcon className="w-8 h-8 text-green-500 dark:text-green-400 flex-shrink-0 mt-1" />
                        )}
                        <div>
                            <h4 className={`font-bold text-lg ${
                                crossReferenceResult.name === "Potentially New Discovery!" 
                                ? 'text-yellow-700 dark:text-yellow-300' 
                                : 'text-green-700 dark:text-green-300'
                            }`}>
                                {crossReferenceResult.name === "Potentially New Discovery!" ? "Potentially New Discovery!" : `Match Found: ${crossReferenceResult.name}`}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{crossReferenceResult.fact}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-amber-500/20 rounded-lg shadow-lg p-6 col-span-1 lg:col-span-2 min-h-[400px] flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-amber-500 dark:text-amber-400">Analysis Results</h2>
      {renderContent()}
    </div>
  );
};

export default ResultsPanel;