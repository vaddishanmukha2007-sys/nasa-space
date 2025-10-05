import React from 'react';
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceArea, ReferenceDot, Legend, Label
} from 'recharts';
// Fix: Add file extension to resolve module.
import type { ExoplanetData } from '../types.ts';
// Fix: Add file extension to resolve module.
import { useSettings } from '../contexts/SettingsContext.ts';

interface DetectionGraphPanelProps {
  data: ExoplanetData;
}

/**
 * Simulates a detection threshold curve. In reality, this is complex,
 * but for visualization, we'll use a curve where deeper transits
 * require less signal-to-noise to be considered a likely detection.
 */
const generateDetectionCurve = () => {
  const curve = [];
  for (let depth = 100; depth <= 10000; depth += 100) {
    // SNR needed decreases as transit depth increases (logarithmically)
    const snr = 30 - 5 * Math.log10(depth);
    curve.push({ depth, snr });
  }
  return curve;
};

/**
 * Calculates a simulated transit depth and SNR from exoplanet data.
 * These are simplified for demonstration purposes.
 * @param data The exoplanet data.
 * @returns An object with the calculated depth and SNR.
 */
const calculateDataPoint = (data: ExoplanetData) => {
  // Transit depth is proportional to (planet_radius / star_radius)^2.
  // We'll simulate star radius based on temperature (hotter = bigger).
  // Depth in parts per million (ppm).
  const starRadiusFactor = data.stellarTemperature / 5778; // Relative to Sun
  const depth = ((data.planetaryRadius / 11.209) / starRadiusFactor)**2 * 100000; // Simplified ppm
  
  // SNR depends on depth, duration, and stellar noise (temp is a proxy).
  // A deeper, longer transit for a quiet (cooler) star is easier to detect.
  const snr = (depth / 500) * Math.sqrt(data.transitDuration) * (5778 / data.stellarTemperature);
  
  return {
    depth: Math.max(10, depth), // Clamp to prevent negative/zero values
    snr: Math.max(1, snr),
  };
};

const CustomTooltipContent = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    if (point.isCurrentUser) {
       return (
        <div className={`p-3 rounded-lg shadow-2xl border text-sm ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'} backdrop-blur-sm`}>
          <p className="font-bold text-base mb-2 text-amber-500 dark:text-amber-400">Your Candidate</p>
          <div className="space-y-1">
            <p className="font-semibold text-slate-700 dark:text-gray-300 flex justify-between items-center">
              <span>Transit Depth:</span>
              <span className="font-mono ml-4">{point.depth.toFixed(0)} ppm</span>
            </p>
             <p className="font-semibold text-slate-700 dark:text-gray-300 flex justify-between items-center">
              <span>Signal-to-Noise:</span>
              <span className="font-mono ml-4">{point.snr.toFixed(2)}</span>
            </p>
          </div>
        </div>
      );
    }
  }
  return null;
};

const DetectionGraphPanel: React.FC<DetectionGraphPanelProps> = ({ data }) => {
  const { theme } = useSettings();
  const axisColor = theme === 'dark' ? '#9ca3af' : '#475569';
  
  const detectionCurve = generateDetectionCurve();
  const currentUserPoint = calculateDataPoint(data);
  const chartData = [
      ...detectionCurve,
      { ...currentUserPoint, isCurrentUser: true }
  ]

  return (
    <>
      <p className="text-slate-600 dark:text-gray-400 text-sm mb-6">
        This graph simulates the likelihood of detecting an exoplanet based on its transit depth and signal quality (SNR). Deeper transits are easier to find.
      </p>
      <div className="w-full h-80">
        <ResponsiveContainer>
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
            
            <XAxis 
              dataKey="depth" 
              type="number" 
              domain={[0, 'dataMax + 500']}
              tick={{ fontSize: 12 }} 
              stroke={axisColor}
              tickFormatter={(val) => `${val.toLocaleString()}`}
            >
              <Label value="Transit Depth (ppm)" offset={-15} position="insideBottom" fill={axisColor} />
            </XAxis>
            <YAxis 
              tick={{ fontSize: 12 }} 
              stroke={axisColor}
              domain={[0, 'dataMax + 5']}
            >
               <Label value="Signal-to-Noise Ratio (SNR)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill={axisColor} />
            </YAxis>

            <Tooltip content={<CustomTooltipContent theme={theme} />} />
            <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '20px'}}/>

            {/* Background Zones */}
            <ReferenceArea y1={10} y2={40} fill="#22c55e" fillOpacity={0.1} label={{ value: 'Likely Detection', position: 'insideTopLeft', fill: '#166534', fontSize: 14, fontWeight: 'bold' }} />
            <ReferenceArea y1={5} y2={10} fill="#f59e0b" fillOpacity={0.1} label={{ value: 'Ambiguous', position: 'insideTopLeft', fill: '#78350f', fontSize: 14, fontWeight: 'bold' }} />
            <ReferenceArea y1={0} y2={5} fill="#ef4444" fillOpacity={0.1} label={{ value: 'Undetected', position: 'insideTopLeft', fill: '#7f1d1d', fontSize: 14, fontWeight: 'bold' }} />
            
            {/* Detection Threshold Curve */}
            <Line 
              dataKey="snr"
              stroke="#4f46e5"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
              name="Detection Threshold"
              legendType="line"
            />
            
            {/* User's Data Point */}
            <Scatter 
              dataKey="isCurrentUser" // Dummy key, we use ReferenceDot for rendering
              fill="transparent" // Hide default scatter dots
              name="Your Candidate"
              legendType="star"
            />

             <ReferenceDot
                x={currentUserPoint.depth}
                y={currentUserPoint.snr}
                r={8}
                fill="#f59e0b"
                stroke={theme === 'dark' ? '#1e293b' : '#ffffff'}
                strokeWidth={2}
                isFront={true}
                ifOverflow="extendDomain"
            >
                <Label value="You are here" position="top" offset={10} fill="#f59e0b" fontWeight="bold"/>
            </ReferenceDot>

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default DetectionGraphPanel;