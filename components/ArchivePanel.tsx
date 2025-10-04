import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MOCK_ARCHIVE_DATA } from '../constants';
import { TelescopeIcon, PlanetCheckIcon, PlanetQuestionIcon, TrendUpIcon } from './Icons';

const StatCard: React.FC<{ label: string; value: string | number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 border border-transparent hover:border-amber-500/30 transition-colors duration-300">
        <div className={`p-3 rounded-full bg-slate-700/50 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
        </div>
    </div>
);


const PieChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className="p-2 bg-slate-800/80 border border-slate-600 rounded-lg shadow-lg backdrop-blur-sm">
        <p className="label text-amber-400 font-bold">{`${name}`}</p>
        <p className="intro text-gray-300">{`Count : ${value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const BarChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-slate-800/80 border border-slate-600 rounded-lg shadow-lg backdrop-blur-sm text-sm">
          <p className="label text-amber-400 font-bold mb-2">{`Year: ${label}`}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }} className="font-medium">
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
};

const ArchivePanel: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState(MOCK_ARCHIVE_DATA[0].year);
    const selectedData = MOCK_ARCHIVE_DATA.find(d => d.year === selectedYear);
    const historicalData = [...MOCK_ARCHIVE_DATA].reverse();

    if (!selectedData) {
        return <p className="text-center text-gray-400">Could not find data for the selected year.</p>;
    }

    const pieData = [
        { name: 'Confirmed', value: selectedData.confirmedExoplanets },
        { name: 'Candidates', value: selectedData.planetaryCandidates },
        { name: 'False Positives', value: selectedData.falsePositives },
    ];
    
    const COLORS: { [key: string]: string } = {
        'Confirmed': '#4ade80',       // text-green-400
        'Candidates': '#facc15',      // text-yellow-400
        'False Positives': '#f87171', // text-red-400
    };

    const discoveryRate = selectedData.totalClassifications > 0 
        ? ((selectedData.confirmedExoplanets / selectedData.totalClassifications) * 100).toFixed(2) + '%' 
        : 'N/A';

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                    Archive & Trends
                </h2>
                <div className="flex items-center gap-2 p-1 bg-slate-700/50 rounded-lg">
                    {MOCK_ARCHIVE_DATA.map(data => (
                        <button 
                            key={data.year}
                            onClick={() => setSelectedYear(data.year)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
                                selectedYear === data.year
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-transparent text-gray-300 hover:bg-slate-600/70'
                            }`}
                        >
                            {data.year}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left side: Selected Year Details */}
                <div className="lg:col-span-3 bg-slate-800/50 border border-amber-500/20 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-200">Breakdown for {selectedYear}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <StatCard label="Total Classifications" value={selectedData.totalClassifications} color="text-white" icon={<TelescopeIcon className="w-6 h-6"/>} />
                        <StatCard label="Discovery Rate" value={discoveryRate} color="text-amber-400" icon={<TrendUpIcon className="w-6 h-6"/>} />
                        <StatCard label="Confirmed Exoplanets" value={selectedData.confirmedExoplanets} color="text-green-400" icon={<PlanetCheckIcon className="w-6 h-6"/>} />
                        <StatCard label="Planetary Candidates" value={selectedData.planetaryCandidates} color="text-yellow-400" icon={<PlanetQuestionIcon className="w-6 h-6"/>} />
                    </div>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={3}
                                >
                                    {pieData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieChartTooltip />} />
                                <Legend formatter={(value) => <span className="text-gray-300">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right side: Historical Trends */}
                <div className="lg:col-span-2 bg-slate-800/50 border border-amber-500/20 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-200">Year-over-Year Trends</h3>
                    <div className="w-full h-[360px]">
                       <ResponsiveContainer>
                            <BarChart data={historicalData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="year" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} allowDecimals={false} width={40}/>
                                <Tooltip content={<BarChartTooltip />} cursor={{fill: 'rgba(100, 116, 139, 0.2)'}} />
                                <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                                <Bar dataKey="confirmedExoplanets" name="Confirmed" stackId="a" fill={COLORS.Confirmed} radius={[4, 4, 0, 0]}/>
                                <Bar dataKey="planetaryCandidates" name="Candidates" stackId="a" fill={COLORS.Candidates} radius={[4, 4, 0, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchivePanel;