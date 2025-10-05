import React, { useState } from 'react';
// Fix: Add file extension to resolve module.
import type { ExoplanetData, ModelMetrics } from '../types.ts';
// Fix: Add file extension to resolve module.
import DetectionGraphPanel from './DetectionGraphPanel.tsx';
// Fix: Add file extension to resolve module.
import PerformancePanel from './PerformancePanel.tsx';

interface VisualsPanelProps {
    data: ExoplanetData;
    metrics: ModelMetrics;
}

const TabButton: React.FC<{ title: string; isActive: boolean; onClick: () => void; }> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors duration-200 ${
            isActive ? 'border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
        }`}
    >
        {title}
    </button>
);

const VisualsPanel: React.FC<VisualsPanelProps> = ({ data, metrics }) => {
    const [activeTab, setActiveTab] = useState<'detection' | 'performance'>('detection');

    return (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-amber-500/20 rounded-lg shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-300 dark:border-slate-700 px-6">
                <div className="flex">
                    <TabButton title="Detection Graph" isActive={activeTab === 'detection'} onClick={() => setActiveTab('detection')} />
                    <TabButton title="Model Performance" isActive={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
                </div>
                 <h2 className="text-2xl font-bold text-amber-500/50 dark:text-amber-400/50 hidden sm:block">
                    Analysis &amp; Visualizations
                </h2>
            </div>
            <div className="p-6">
                {activeTab === 'detection' && (
                    <div className="animate-fade-in-fast">
                        <DetectionGraphPanel data={data} />
                    </div>
                )}
                {activeTab === 'performance' && (
                    <div className="animate-fade-in-fast">
                        <PerformancePanel metrics={metrics} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualsPanel;