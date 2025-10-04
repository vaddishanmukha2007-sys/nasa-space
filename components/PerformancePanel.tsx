import React, { useState } from 'react';
// Fix: Corrected typo in the import of MOCK_CONFUSION_MATRIX.
import { MOCK_CONFUSION_MATRIX, MOCK_DETAILED_METRICS } from '../constants';
import type { ModelMetrics } from '../types';
import MetricsBarChart from './MetricsBarChart';

interface PerformancePanelProps {
    isRetraining: boolean;
    metrics: ModelMetrics;
}

const RetrainingOverlay: React.FC = () => (
    <div className="absolute inset-0 bg-slate-800/80 flex flex-col items-center justify-center rounded-lg z-10">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-amber-400"></div>
        <p className="mt-4 text-gray-300">Recalculating performance metrics...</p>
    </div>
);


const PerformancePanel: React.FC<PerformancePanelProps> = ({ isRetraining, metrics }) => {
  const [highlightedMetric, setHighlightedMetric] = useState<string | null>(null);

  const metricRelationships: { [key: string]: string[] } = {
    // When a bar is hovered, which cards should highlight?
    'Accuracy': ['True Positives', 'False Negatives', 'False Positives', 'True Negatives'],
    'Precision': ['True Positives', 'False Positives'],
    'Recall': ['True Positives', 'False Negatives'],
    'F1-Score': ['True Positives', 'False Negatives', 'False Positives'],
    // When a card is hovered, which bars should highlight?
    'True Positives': ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
    'False Negatives': ['Accuracy', 'Recall', 'F1-Score'],
    'False Positives': ['Accuracy', 'Precision', 'F1-Score'],
    'True Negatives': ['Accuracy'],
  };

  const detailedMetricsData = [
    { label: "True Positives", value: MOCK_DETAILED_METRICS.truePositives, color: "text-green-400" },
    { label: "False Negatives", value: MOCK_DETAILED_METRICS.falseNegatives, color: "text-orange-400" },
    { label: "False Positives", value: MOCK_DETAILED_METRICS.falsePositives, color: "text-orange-400" },
    { label: "True Negatives", value: MOCK_DETAILED_METRICS.trueNegatives, color: "text-green-400" }
  ];

  return (
    <div className="bg-slate-800/50 border border-amber-500/20 rounded-lg shadow-lg p-6 relative">
      {isRetraining && <RetrainingOverlay />}
      <div className={isRetraining ? 'blur-sm transition-all duration-500' : 'transition-all duration-500'}>
        <h2 className="text-2xl font-bold mb-4 text-amber-400">Model Performance</h2>
        
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Overall Metrics</h3>
        <div className="mb-6">
            <MetricsBarChart
              metrics={metrics}
              highlightedMetric={highlightedMetric}
              setHighlightedMetric={setHighlightedMetric}
              relationships={metricRelationships}
            />
        </div>

        <h3 className="text-lg font-semibold text-gray-300 mb-2 mt-8">
          Detailed Breakdown
          <span className="text-sm text-gray-500 ml-2">(One-vs-Rest for "Confirmed" class)</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {detailedMetricsData.map(metric => {
            const isHighlighted = highlightedMetric === metric.label || 
                                (highlightedMetric && metricRelationships[highlightedMetric]?.includes(metric.label));
            return (
              <MetricCard 
                key={metric.label}
                label={metric.label}
                value={metric.value} 
                color={metric.color}
                onMouseEnter={() => setHighlightedMetric(metric.label)}
                onMouseLeave={() => setHighlightedMetric(null)}
                isHighlighted={isHighlighted}
              />
            );
          })}
        </div>

        <h3 className="text-lg font-semibold text-gray-300 mb-2 mt-8">Confusion Matrix</h3>
        <ConfusionMatrix />

        {/* New Model Details Section */}
        <h3 className="text-lg font-semibold text-gray-300 mb-3 mt-8">
          Model Architecture &amp; Training
        </h3>
        <div className="bg-slate-700/50 p-4 rounded-lg text-gray-400 text-sm space-y-4">
          <div>
            <h4 className="font-semibold text-gray-200 mb-1">Architecture</h4>
            <p>
              The classification model is a <strong>Gemini 2.5 Flash</strong> foundation model, specifically utilized for its advanced multimodal analysis capabilities. It processes both the tabular exoplanet parameters and a visual representation of the light curve, functioning similarly to how a Convolutional Neural Network (CNN) would analyze an image to detect subtle patterns.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200 mb-1">Training Data</h4>
            <p>
              The model's visual analysis capabilities were trained on a vast, proprietary dataset of simulated and real-world light curves from missions like <strong>Kepler, K2, and TESS</strong>. This dataset includes millions of examples covering confirmed exoplanets, eclipsing binaries, stellar variability, and various instrumental artifacts.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200 mb-1">Key Features</h4>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Multimodal Input:</strong> Fuses numerical parameters and visual data for more robust and context-aware analysis.</li>
              <li><strong>High-Fidelity Simulation:</strong> Trained on data simulating a wide range of astrophysical scenarios to improve generalization.</li>
              <li><strong>Transfer Learning:</strong> Leverages the powerful, pre-trained pattern recognition of the Gemini foundation model for state-of-the-art performance.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
    label: string;
    value: number;
    isPercentage?: boolean;
    color?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    isHighlighted?: boolean;
}
const MetricCard: React.FC<MetricCardProps> = ({ label, value, isPercentage = false, color = 'text-amber-400', onMouseEnter, onMouseLeave, isHighlighted }) => (
    <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`bg-slate-700/50 p-4 rounded-lg text-center transition-all duration-300 transform cursor-pointer border-2 ${
            isHighlighted
                ? 'scale-110 bg-slate-700 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'border-transparent hover:scale-105 hover:bg-slate-700 hover:border-amber-500/40'
        }`}
    >
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>
            {isPercentage ? `${(value * 100).toFixed(1)}%` : value.toLocaleString()}
        </p>
    </div>
);

const ConfusionMatrix: React.FC = () => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
            <caption className="p-2 text-xs text-gray-400 caption-bottom">Predicted Class</caption>
            <thead className="text-xs text-gray-400 uppercase bg-slate-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3">Actual Class</th>
                    {MOCK_CONFUSION_MATRIX.labels.map(label => (
                        <th key={label} scope="col" className="px-6 py-3 text-center">{label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {MOCK_CONFUSION_MATRIX.values.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-slate-700">
                        <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap text-amber-400">{MOCK_CONFUSION_MATRIX.labels[rowIndex]}</th>
                        {row.map((value, colIndex) => (
                            <td key={colIndex} className={`px-6 py-4 text-center font-mono ${rowIndex === colIndex ? 'text-green-400 font-bold' : ''}`}>{value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export default PerformancePanel;