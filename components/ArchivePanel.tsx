import React from 'react';
import { MOCK_ARCHIVE_DATA } from '../constants';
import { YearlyArchiveData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSettings } from '../contexts/SettingsContext';
import { TelescopeIcon, PlanetCheckIcon, TrendUpIcon } from './Icons';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-slate-200 dark:bg-slate-700/50 p-4 rounded-lg flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        </div>
    </div>
);


const ArchivePanel: React.FC = () => {
    const { theme } = useSettings();
    const axisColor = theme === 'dark' ? '#9ca3af' : '#475569';
    
    // Calculate totals for summary cards
    const totalClassifications = MOCK_ARCHIVE_DATA.reduce((sum, item) => sum + item.totalClassifications, 0);
    const totalConfirmed = MOCK_ARCHIVE_DATA.reduce((sum, item) => sum + item.confirmedExoplanets, 0);
    const averagePerYear = totalClassifications / MOCK_ARCHIVE_DATA.length;

    const chartData = MOCK_ARCHIVE_DATA.map(item => ({
        name: item.year.toString(),
        "Confirmed": item.confirmedExoplanets,
        "Candidates": item.planetaryCandidates,
        "False Positives": item.falsePositives,
    })).reverse(); // Reverse to show years chronologically in the chart

    return (
        <main className="mt-8 animate-fade-in">
            <div className="bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-amber-500/20 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-amber-500 dark:text-amber-400">Yearly Archive &amp; Trends</h2>
                <p className="text-slate-600 dark:text-gray-400 text-sm mb-6">
                    A historical overview of exoplanet classification data submitted to the project.
                </p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <StatCard 
                        icon={<TelescopeIcon className="w-6 h-6 text-white"/>} 
                        label="Total Classifications" 
                        value={totalClassifications.toLocaleString()}
                        color="bg-blue-500"
                    />
                    <StatCard 
                        icon={<PlanetCheckIcon className="w-6 h-6 text-white"/>} 
                        label="Total Confirmed Exoplanets" 
                        value={totalConfirmed.toLocaleString()}
                        color="bg-green-500"
                    />
                    <StatCard 
                        icon={<TrendUpIcon className="w-6 h-6 text-white"/>} 
                        label="Avg. Classifications / Year" 
                        value={Math.round(averagePerYear).toLocaleString()}
                        color="bg-amber-500"
                    />
                </div>

                {/* Chart */}
                <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-4">Classification Volume by Year</h3>
                <div className="w-full h-80 mb-8">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                            <XAxis dataKey="name" stroke={axisColor} tick={{ fontSize: 12 }} />
                            <YAxis stroke={axisColor} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                                    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}` 
                                }} 
                                labelStyle={{ color: theme === 'dark' ? '#e5e7eb' : '#1e293b' }}
                                cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}
                            />
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Bar dataKey="Confirmed" stackId="a" fill="#22c55e" />
                            <Bar dataKey="Candidates" stackId="a" fill="#f59e0b" />
                            <Bar dataKey="False Positives" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Table */}
                <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-4">Detailed Data</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-300 dark:border-slate-700">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                            <tr>
                                <th className="p-3">Year</th>
                                <th className="p-3 text-right">Total Classifications</th>
                                <th className="p-3 text-right">Confirmed Exoplanets</th>
                                <th className="p-3 text-right">Planetary Candidates</th>
                                <th className="p-3 text-right">False Positives</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-gray-200">
                            {MOCK_ARCHIVE_DATA.map((row: YearlyArchiveData) => (
                                <tr key={row.year} className="border-t border-slate-300 dark:border-slate-700">
                                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">{row.year}</td>
                                    <td className="p-3 font-mono text-right">{row.totalClassifications.toLocaleString()}</td>
                                    <td className="p-3 font-mono text-right text-green-600 dark:text-green-400">{row.confirmedExoplanets.toLocaleString()}</td>
                                    <td className="p-3 font-mono text-right text-yellow-600 dark:text-yellow-400">{row.planetaryCandidates.toLocaleString()}</td>
                                    <td className="p-3 font-mono text-right text-red-600 dark:text-red-400">{row.falsePositives.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </main>
    );
};

export default ArchivePanel;
