import React from 'react';
import type { Hyperparameters } from '../types';

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
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHyperparameters({
      ...hyperparameters,
      [e.target.name]: parseFloat(e.target.value),
    });
  };

  return (
    <div className="bg-slate-800/50 border border-amber-500/20 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-amber-400">Model Controls</h2>
      <p className="text-gray-400 text-sm mb-6">
        Adjust hyperparameters and retrain the model. (This is for demonstration purposes).
      </p>
      <div className="space-y-6">
        <SliderField 
            label="Learning Rate" 
            name="learningRate" 
            value={hyperparameters.learningRate} 
            onChange={handleSliderChange} 
            min={0.001} max={0.1} step={0.001}
        />
        <SliderField 
            label="Max Depth" 
            name="maxDepth" 
            value={hyperparameters.maxDepth} 
            onChange={handleSliderChange} 
            min={2} max={15} step={1}
        />
        <SliderField 
            label="N Estimators" 
            name="nEstimators" 
            value={hyperparameters.nEstimators} 
            onChange={handleSliderChange} 
            min={50} max={500} step={10}
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


interface SliderFieldProps {
    label: string;
    name: keyof Hyperparameters;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    min: number;
    max: number;
    step: number;
}

const SliderField: React.FC<SliderFieldProps> = ({ label, name, value, onChange, min, max, step }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
            <span>{label}</span>
            <span className="text-amber-400 font-mono">{name === 'learningRate' ? value.toFixed(3) : value}</span>
        </label>
        <input
            type="range"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);


export default ControlPanel;