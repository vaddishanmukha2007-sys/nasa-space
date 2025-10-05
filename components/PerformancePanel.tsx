import React from 'react';
// Fix: Add file extension to resolve module.
import type { ModelMetrics } from '../types.ts';
// Fix: Add file extension to resolve module.
import { MOCK_DETAILED_METRICS, MOCK_CONFUSION_MATRIX } from '../constants.ts';
// Fix: Add file extension to resolve module.
import MetricsBarChart from './MetricsBarChart.tsx';

interface PerformancePanelProps {
    metrics: ModelMetrics;
}

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div className="bg-slate-200 dark:bg-slate-700/50 p-3 rounded-lg text-center">
        <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
        <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

const PerformancePanel: React.FC<PerformancePanelProps> = ({ metrics }) => {
    // Update detailed metrics with live data
    const detailedMetrics = MOCK_DETAILED_METRICS.map(m => {
        switch(m.name.toLowerCase()) {
            case 'accuracy': return { ...m, value: metrics.accuracy };
            case 'precision': return { ...m, value: metrics.precision };
            case 'recall': return { ...m, value: metrics.recall };
            case 'f1-score': return { ...m, value: metrics.f1Score };
            default: return m;
        }
    });

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} color="text-blue-500 dark:text-blue-400" />
                <StatCard label="Precision" value={`${(metrics.precision * 100).toFixed(1)}%`} color="text-green-500 dark:text-green-400" />
                <StatCard label="Recall" value={`${(metrics.recall * 100).toFixed(1)}%`} color="text-yellow-500 dark:text-yellow-400" />
                <StatCard label="F1-Score" value={`${(metrics.f1Score).toFixed(3)}`} color="text-orange-500 dark:text-orange-400" />
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-2">Metrics Overview</h3>
                <MetricsBarChart data={detailedMetrics} />
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-2">Confusion Matrix</h3>
                <div className="flex justify-center">
                    <div className="grid grid-cols-3 text-sm gap-x-2">
                        <div></div>
                        <div className="font-bold text-center text-slate-500 dark:text-gray-400">Predicted Positive</div>
                        <div className="font-bold text-center text-slate-500 dark:text-gray-400">Predicted Negative</div>
                        
                        <div className="font-bold text-slate-500 dark:text-gray-400 self-center text-right">Actual Positive</div>
                        <div className="bg-green-200 dark:bg-green-900/70 text-green-800 dark:text-green-300 p-4 rounded-lg text-center font-mono text-lg">{MOCK_CONFUSION_MATRIX[1][1]}</div>
                        <div className="bg-red-200 dark:bg-red-900/70 text-red-800 dark:text-red-300 p-4 rounded-lg text-center font-mono text-lg">{MOCK_CONFUSION_MATRIX[1][0]}</div>

                        <div className="font-bold text-slate-500 dark:text-gray-400 self-center text-right">Actual Negative</div>
                        <div className="bg-yellow-200 dark:bg-yellow-900/70 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg text-center font-mono text-lg">{MOCK_CONFUSION_MATRIX[0][1]}</div>
                        <div className="bg-slate-200 dark:bg-slate-700/50 p-4 rounded-lg text-center font-mono text-lg">{MOCK_CONFUSION_MATRIX[0][0]}</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PerformancePanel;