import React from 'react';
import type { Hyperparameters } from '../types';
import { DEFAULT_HYPERPARAMETERS } from '../constants';

interface ControlPanelProps {
  hyperparameters: Hyperparameters;
  setHyperparameters: React.Dispatch<React.SetStateAction<Hyperparameters>>;
  onRetrain: () => void;
  isRetraining: boolean;
}

const RetrainSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const ControlPanel: React.FC<ControlPanelProps> = ({ hyperparameters, setHyperparameters, onRetrain, isRetraining }) => {
  const handleHyperparameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);
    
    // Prevent non-numeric values from updating the state
    if (!isNaN(numericValue)) {
      setHyperparameters({
        ...hyperparameters,
        [name]: numericValue,
      });
    }
  };
  
  const handleReset = () => {
    setHyperparameters(DEFAULT_HYPERPARAMETERS);
  };

  return (
    <div className="bg-slate-800/50 border border-amber-500/20 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-400">Model Controls</h2>
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-amber-400 border border-slate-600 px-3 py-1 rounded-md transition-colors duration-300 hover:border-amber-500/50"
          >
            Reset Defaults
          </button>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Adjust hyperparameters and retrain the model. (This is for demonstration purposes).
      </p>
      <div className="space-y-6">
        <HyperparameterField 
            label="Learning Rate" 
            name="learningRate" 
            value={hyperparameters.learningRate} 
            onChange={handleHyperparameterChange} 
            min={0.001} max={0.1} step={0.001}
            tooltip="Controls how quickly the model adapts. Lower values are slower but can be more precise."
        />
        <HyperparameterField 
            label="Max Depth" 
            name="maxDepth" 
            value={hyperparameters.maxDepth} 
            onChange={handleHyperparameterChange} 
            min={2} max={15} step={1}
            tooltip="The maximum depth of the decision trees. Deeper trees are more complex and can overfit."
        />
        <HyperparameterField 
            label="N Estimators" 
            name="nEstimators" 
            value={hyperparameters.nEstimators} 
            onChange={handleHyperparameterChange} 
            min={50} max={500} step={10}
            tooltip="The number of decision trees in the model. More trees can improve performance but increase training time."
        />
      </div>
       <button 
        onClick={onRetrain}
        disabled={isRetraining}
        className="w-full mt-8 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isRetraining ? (
            <>
                <RetrainSpinner />
                <span>Training in Progress...</span>
            </>
        ) : (
            "Retrain Model"
        )}
      </button>
    </div>
  );
};


interface HyperparameterFieldProps {
    label: string;
    name: keyof Hyperparameters;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    min: number;
    max: number;
    step: number;
    tooltip: string;
}

const InfoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const HyperparameterField: React.FC<HyperparameterFieldProps> = ({ label, name, value, onChange, min, max, step, tooltip }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 group relative">
                <label htmlFor={name} className="block text-sm font-medium text-gray-300">
                    {label}
                </label>
                <InfoIcon className="w-4 h-4 text-gray-500" />
                <div className="absolute bottom-full mb-2 w-64 p-2 bg-slate-900 border border-slate-700 text-gray-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                    {tooltip}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <input
                type="range"
                id={`${name}-range`}
                name={name}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                step={step}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                aria-label={`${label} slider`}
            />
            <input
                type="number"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                step={step}
                className="w-28 text-center bg-slate-900/60 border border-slate-600 rounded-lg py-1 px-2 font-mono text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300"
                aria-label={`${label} value`}
            />
        </div>
    </div>
);


export default ControlPanel;