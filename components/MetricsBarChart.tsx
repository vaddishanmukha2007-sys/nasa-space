import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ModelMetrics } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface MetricsBarChartProps {
    metrics: ModelMetrics;
    highlightedMetric: string | null;
    setHighlightedMetric: (metric: string | null) => void;
    relationships: { [key: string]: string[] };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const CustomTooltip = ({ active, payload, label }: any) => {
    const { theme } = useSettings();
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="label text-amber-600 dark:text-amber-400 font-bold">{`${label}`}</p>
          <p className="intro text-slate-700 dark:text-gray-300">{`Value : ${(payload[0].value * 100).toFixed(2)}%`}</p>
        </div>
      );
    }
  
    return null;
  };

const MetricsBarChart: React.FC<MetricsBarChartProps> = ({ metrics, highlightedMetric, setHighlightedMetric, relationships }) => {
    const { theme } = useSettings();
    const axisColor = theme === 'dark' ? '#9ca3af' : '#475569';
    const data = [
        { name: 'Accuracy', value: metrics.accuracy },
        { name: 'Precision', value: metrics.precision },
        { name: 'Recall', value: metrics.recall },
        { name: 'F1-Score', value: metrics.f1Score },
    ].sort((a, b) => b.value - a.value); // Sort for better visualization

    const formatPercent = (tickItem: number) => `${(tickItem * 100).toFixed(0)}%`;

    return (
        <div className="w-full h-[250px] animate-fade-in">
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    onMouseMove={(state) => {
                      if (state.isTooltipActive && state.activeLabel) {
                        if (highlightedMetric !== state.activeLabel) {
                          setHighlightedMetric(state.activeLabel);
                        }
                      } else {
                        if (highlightedMetric !== null) {
                           setHighlightedMetric(null);
                        }
                      }
                    }}
                    onMouseLeave={() => {
                        if (highlightedMetric !== null) {
                          setHighlightedMetric(null);
                        }
                    }}
                >
                    <XAxis dataKey="name" stroke={axisColor} tick={{ fontSize: 12 }} />
                    <YAxis 
                        stroke={axisColor}
                        tick={{ fontSize: 12 }} 
                        domain={[0, 1]} 
                        tickFormatter={formatPercent}
                    />
                    <Tooltip 
                        cursor={{fill: 'rgba(100, 116, 139, 0.2)'}}
                        content={<CustomTooltip />}
                        animationDuration={200}
                    />
                    <Bar dataKey="value" fill="#8884d8" barSize={50} radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => {
                            const barName = entry.name;
                            const isDirectlyHovered = highlightedMetric === barName;
                            const isRelated = highlightedMetric && relationships[highlightedMetric]?.includes(barName);
                            const isHighlighted = isDirectlyHovered || isRelated;
                            const isDimmed = highlightedMetric && !isHighlighted;

                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                                style={{
                                    transition: 'opacity 0.3s ease',
                                    opacity: isDimmed ? 0.3 : 1,
                                }}
                              />
                            );
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MetricsBarChart;