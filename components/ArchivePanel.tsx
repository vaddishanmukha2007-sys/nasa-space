import React from 'react';
import { MOCK_ARCHIVE_DATA } from '../constants';
import { YearlyArchiveData } from '../types';
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
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

const CustomTooltip = ({ active, payload, label, theme }: any) => {
    if (active && payload && payload.length) {
        const totalPayload = payload.find(p => p.dataKey === 'Total');
        const breakdownPayload = payload.filter(p => p.dataKey !== 'Total' && p.value > 0);

        return (
            <div className={`p-4 rounded-lg shadow-2xl border ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'} backdrop-blur-sm`}>
                <p className="font-bold text-lg mb-2 text-slate-800 dark:text-gray-200">{label}</p>
                {totalPayload && (
                    <div className="mb-2 pb-2 border-b border-slate-300 dark:border-slate-600">
                         <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 flex justify-between items-center">
                            <span>Total Classifications</span>
                            <span className="font-mono text-indigo-500 dark:text-indigo-400">{totalPayload.value.toLocaleString()}</span>
                        </p>
                    </div>
                )}
                <div className="space-y-1">
                    {breakdownPayload.slice().reverse().map((pld, index) => (
                         <p key={index} className="text-sm text-slate-600 dark:text-gray-400 flex justify-between items-center">
                            <span className="flex items-center">
                                <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: pld.fill }}></span>
                                {pld.name}
                            </span>
                            <span className="font-mono">{pld.value.toLocaleString()}</span>
                        </p>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};


const ArchivePanel: React.FC = () => {
    const { theme } = useSettings();
    const axisColor = theme === 'dark' ? '#9ca3af' : '#475569';
    
    const totalClassifications = MOCK_ARCHIVE_DATA.reduce((sum, item) => sum + item.totalClassifications, 0);
    const totalConfirmed = MOCK_ARCHIVE_DATA.reduce((sum, item) => sum + item.confirmedExoplanets, 0);
    const averagePerYear = totalClassifications / MOCK_ARCHIVE_DATA.length;

    const chartData = MOCK_ARCHIVE_DATA.map(item => ({
        name: item.year.toString(),
        "Confirmed": item.confirmedExoplanets,
        "Candidates": item.planetaryCandidates,
        "False Positives": item.falsePositives,
        "Total": item.totalClassifications,
    })).reverse();

    return (
        <main className="mt-8 animate-fade-in">
            <div className="bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-amber-500/20 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-amber-500 dark:text-amber-400">Yearly Archive &amp; Trends</h2>
                <p className="text-slate-600 dark:text-gray-400 text-sm mb-6">
                    A historical overview of exoplanet classification data submitted to the project.
                </p>

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

                <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-4">Classification Volume by Year</h3>
                <div className="w-full h-80 mb-8">
                     <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                            <XAxis dataKey="name" stroke={axisColor} tick={{ fontSize: 12 }} />
                            <YAxis stroke={axisColor} tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip theme={theme} />} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}/>
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Bar dataKey="False Positives" stackId="a" fill="#ef4444" />
                            <Bar dataKey="Candidates" stackId="a" fill="#f59e0b" />
                            <Bar dataKey="Confirmed" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]}/>
                            <Area type="monotone" dataKey="Total" fill="url(#totalGradient)" stroke="none" />
                            <Line type="monotone" dataKey="Total" stroke="#8884d8" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 7 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

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