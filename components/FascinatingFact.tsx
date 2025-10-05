import React, { useState, useEffect, useCallback } from 'react';
import type { ExoplanetData, ClassificationResult } from '../types.ts';
import { getFascinatingFact } from '../services/geminiService.ts';
import { LightbulbIcon } from './Icons.tsx';

interface FascinatingFactProps {
    data: ExoplanetData;
    classificationResult: ClassificationResult | null;
}

const RefreshIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.695v.001" />
    </svg>
);


const FascinatingFact: React.FC<FascinatingFactProps> = ({ data, classificationResult }) => {
    const [fact, setFact] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFact = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const newFact = await getFascinatingFact(data);
            setFact(newFact);
        } catch (e) {
            setError("Could not generate a cosmic fact right now. The universe is being mysterious!");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [data]);
    
    // Fetch a new fact whenever a new classification is successful
    useEffect(() => {
        if (classificationResult) {
            fetchFact();
        }
    }, [classificationResult, fetchFact]);

    // Initial fetch on component mount
    useEffect(() => {
        fetchFact();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-2">
                    <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-full animate-pulse [animation-delay:0.1s]"></div>
                    <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/2 animate-pulse [animation-delay:0.2s]"></div>
                </div>
            );
        }

        if (error) {
            return <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>;
        }

        return <p className="text-slate-600 dark:text-gray-300 leading-relaxed">{fact}</p>;
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-amber-500/20 rounded-lg shadow-lg p-6 relative animate-fade-in-fast">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-200 dark:bg-yellow-900/70 p-2 rounded-full">
                        <LightbulbIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-bold text-amber-500 dark:text-amber-400">Cosmic Fact</h2>
                </div>
                <button
                    onClick={fetchFact}
                    disabled={isLoading}
                    className="p-2 rounded-full text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    aria-label="Generate new fact"
                >
                    <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default FascinatingFact;