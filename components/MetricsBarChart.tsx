import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// Fix: Add file extension to resolve module.
import { useSettings } from '../contexts/SettingsContext.ts';

interface ChartData {
    name: string;
    value: number;
    fill: string;
}

interface MetricsBarChartProps {
    data: ChartData[];
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className={`p-2 rounded-lg shadow-lg border text-sm ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
                <p className="font-bold">{`${label}`}</p>
                <p className="text-amber-500 dark:text-amber-400">{`Value: ${payload[0].value.toFixed(3)}`}</p>
            </div>
        );
    }
    return null;
};

const MetricsBarChart: React.FC<MetricsBarChartProps> = ({ data }) => {
    const { theme } = useSettings();
    const axisColor = theme === 'dark' ? '#9ca3af' : '#475569';
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <XAxis type="number" domain={[0.8, 1]} hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} width={80} />
                <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default MetricsBarChart;