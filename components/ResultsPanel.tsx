import React, from 'react';
import type { ClassificationResult, ExoplanetData, CrossReferenceResult } from '../types.ts';
import { CLASSIFICATION_DETAILS } from '../constants';
import { useSettings } from '../contexts/SettingsContext';
import { convertToDisplayValue, getUnitConfig } from '../utils/units';
import { DatabaseIcon } from './Icons';

interface ResultsPanelProps {
  isLoading: boolean;
  classificationResult: ClassificationResult | null;
  data: ExoplanetData;
  crossReferenceResult: CrossReferenceResult;
  onReset: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-amber-500 dark:border-amber-400"></div>
        <p className="mt-4 text-slate-600 dark:text-gray-300">Analyzing light curve with Gemini...</p>
    </div>
);

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 mb-4 text-amber-400/50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m-3.5 14.5a3 3 0 116 0 3 3 0 01-6 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3 3 0 116 0 3 3 0 01-6 0z" />
            </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300">Awaiting Analysis</h3>
        <p className="text-slate-500 dark:text-gray-400 mt-2">Enter your parameters or upload a file and click "Classify" to begin the AI analysis.</p>
    </div>
);


const ResultsPanel: React.FC<ResultsPanelProps> = ({ isLoading, classificationResult, data, crossReferenceResult, onReset }) => {
    const resultDetails = classificationResult ? CLASSIFICATION_DETAILS[classificationResult] : null;
    const { units } = useSettings();
    const unitConfig = getUnitConfig(units);

    const renderContent = () => {
        if (isLoading) {
            return <LoadingSpinner />;
        }
        if (!classificationResult || !resultDetails) {
            return <InitialState />;
        }
        
        const displayData = {
          orbitalPeriod: `${convertToDisplayValue(data.orbitalPeriod, units.orbitalPeriod).toFixed(2)} ${unitConfig.orbitalPeriod.label}`,
          transitDuration: `${data.transitDuration.toFixed(2)} ${unitConfig.transitDuration.label}`,
          planetaryRadius: `${convertToDisplayValue(data.planetaryRadius, units.planetaryRadius).toFixed(2)} ${unitConfig.planetaryRadius.label}`,
          stellarTemperature: `${convertToDisplayValue(data.stellarTemperature, units.stellarTemperature).toFixed(0)} ${unitConfig.stellarTemperature.label}`,
        };

        return (
            <div className="animate-fade-in">
                <div className={`p-4 rounded-lg border-2 text-center ${resultDetails.color}`}>
                    <p className="text-sm font-semibold uppercase tracking-wider">Classification Result</p>
                    <h3 className="text-3xl font-bold mt-1">{resultDetails.label}</h3>
                </div>
                <p className="text-slate-600 dark:text-gray-400 mt-4 text-center text-sm">{resultDetails.description}</p>
                
                <div className="mt-6 pt-6 border-t border-slate-300 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-3">Input Summary</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 py-1">
                            <span className="text-slate-500 dark:text-gray-400">Orbital Period</span>
                            <span className="font-mono text-amber-600 dark:text-amber-400">{displayData.orbitalPeriod}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 py-1">
                            <span className="text-slate-500 dark:text-gray-400">Transit Duration</span>
                            <span className="font-mono text-amber-600 dark:text-amber-400">{displayData.transitDuration}</span>
                        </div>
                         <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 py-1">
                            <span className="text-slate-500 dark:text-gray-400">Planetary Radius</span>
                            <span className="font-mono text-amber-600 dark:text-amber-400">{displayData.planetaryRadius}</span>
                        </div>
                         <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 py-1">
                            <span className="text-slate-500 dark:text-gray-400">Stellar Temperature</span>
                            <span className="font-mono text-amber-600 dark:text-amber-400">{displayData.stellarTemperature}</span>
                        </div>
                    </div>
                </div>

                {/* NASA Cross-Reference Section */}
                {crossReferenceResult && (
                    <div className="mt-6 pt-6 border-t border-slate-300 dark:border-slate-700 animate-fade-in">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <DatabaseIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            NASA Archive Cross-Reference
                        </h3>
                        {crossReferenceResult === 'no_match' ? (
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg border border-blue-300 dark:border-blue-600/50 text-blue-800 dark:text-blue-300 text-sm">
                                <p className="font-bold">Potentially New Discovery!</p>
                                <p>Your input parameters do not match any known exoplanets in our 2024-2025 NASA data archive.</p>
                            </div>
                        ) : (
                            <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg border border-green-300 dark:border-green-600/50 text-green-800 dark:text-green-300 text-sm">
                                <p className="font-bold">Potential Match Found!</p>
                                <p>Your input is similar to a known exoplanet:</p>
                                <div className="mt-2 pt-2 border-t border-green-300/50 dark:border-green-600/50 font-mono text-xs space-y-1">
                                    <p><strong>Name:</strong> {crossReferenceResult.name}</p>
                                    <p><strong>Discovered:</strong> {crossReferenceResult.discoveryYear}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-amber-500/20 rounded-lg shadow-lg p-6 min-h-[400px] flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-bold mb-4 text-amber-500 dark:text-amber-400">Analysis Results</h2>
                <div className="min-h-[250px] relative">
                    {renderContent()}
                </div>
            </div>
            {classificationResult && (
                 <button 
                    onClick={onReset}
                    className="w-full mt-6 bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-lg">
                    Analyze Another Candidate
                </button>
            )}
        </div>
    );
};

export default ResultsPanel;