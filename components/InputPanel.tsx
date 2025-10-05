import React, { useState, ChangeEvent, useEffect } from 'react';
// Fix: Add file extension to resolve module.
import type { ExoplanetData, Hyperparameters } from '../types.ts';
import { parseExoplanetCsv, previewExoplanetCsv } from '../utils/csvParser';
import { useSettings } from '../contexts/SettingsContext';
import { getUnitConfig, convertToDisplayValue, convertFromDisplayValue } from '../utils/units';

interface InputPanelProps {
  data: ExoplanetData;
  setData: React.Dispatch<React.SetStateAction<ExoplanetData>>;
  onClassify: () => void;
  hyperparameters: Hyperparameters;
  setHyperparameters: React.Dispatch<React.SetStateAction<Hyperparameters>>;
  onRetrain: () => void;
  isRetraining: boolean;
}

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const InfoIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const HyperparameterSlider: React.FC<{
    label: string;
    name: keyof Hyperparameters;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, min, max, step, onChange }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1">
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-gray-300">{label}</label>
            <span className="font-mono text-sm text-amber-600 dark:text-amber-400">{name === 'learningRate' ? value.toFixed(4) : value}</span>
        </div>
        <input
            type="range"
            id={name}
            name={name}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={onChange}
            className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

const RetrainSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const InputPanel: React.FC<InputPanelProps> = ({ data, setData, onClassify, hyperparameters, setHyperparameters, onRetrain, isRetraining }) => {
  const { units } = useSettings();
  const unitConfig = getUnitConfig(units);

  const [activeTab, setActiveTab] = useState<'manual' | 'upload' | 'model'>('manual');
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<ExoplanetData[] | null>(null);
  const [rawCsvContent, setRawCsvContent] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ExoplanetData, string>>>({});
  
  // Local state for values displayed in inputs, reflecting user's unit preference
  const [displayValues, setDisplayValues] = useState({
      orbitalPeriod: 0,
      transitDuration: 0,
      planetaryRadius: 0,
      stellarTemperature: 0,
  });

  // Effect to update display values when base data or units change
  useEffect(() => {
    setDisplayValues({
        orbitalPeriod: convertToDisplayValue(data.orbitalPeriod, units.orbitalPeriod),
        transitDuration: data.transitDuration, // Duration is always in hours
        planetaryRadius: convertToDisplayValue(data.planetaryRadius, units.planetaryRadius),
        stellarTemperature: convertToDisplayValue(data.stellarTemperature, units.stellarTemperature),
    });
  }, [data, units]);


  const validateField = (name: keyof ExoplanetData, value: number): string | undefined => {
    if (name === 'name') return; // Skip numeric validation for name
    const config = (unitConfig as any)[name];
    if (value < config.min || value > config.max) {
      return `Must be between ${config.min.toFixed(2)} and ${config.max.toFixed(2)}.`;
    }
    return undefined;
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setData(prevData => ({...prevData, name: newName}));
    if (!newName.trim()) {
        setErrors(prev => ({...prev, name: 'Name cannot be empty.'}));
    } else {
        setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.name;
            return newErrors;
        });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof ExoplanetData;
    const value = e.target.value;
    const numericValue = value === '' ? NaN : parseFloat(value);
    
    // Update local display state
    setDisplayValues(prev => ({ ...prev, [name]: numericValue }));

    if (isNaN(numericValue)) {
      setErrors({ ...errors, [name]: 'Please enter a valid number.' });
      return;
    }

    // Convert from display unit back to base unit and update parent state
    let baseValue = numericValue;
    if (name !== 'transitDuration' && name in units) { // Assuming transitDuration is not converted
        baseValue = convertFromDisplayValue(numericValue, units[name as keyof typeof units]);
    }
    setData(prevData => ({ ...prevData, [name]: baseValue }));

    const error = validateField(name, numericValue);
    setErrors({ ...errors, [name]: error });
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setFileName(file.name);
    setUploadError(null);
    setCsvPreview(null);
    setRawCsvContent(null);

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
            try {
                const previewData = previewExoplanetCsv(content);
                if (previewData.length === 0) {
                    throw new Error("No valid data rows found in CSV.");
                }
                setCsvPreview(previewData);
                setRawCsvContent(content);
            } catch (error) {
                const message = error instanceof Error ? error.message : "An unknown parsing error occurred.";
                setUploadError(message);
                setFileName(null);
            }
        }
    };
    reader.onerror = () => {
        setUploadError("Failed to read the file.");
        setFileName(null);
    };
    reader.readAsText(file);
  };

  const handleConfirmLoad = () => {
    if (rawCsvContent) {
        try {
            const firstRowData = parseExoplanetCsv(rawCsvContent);
            setData(firstRowData);
            alert(`Success! File "${fileName}" was parsed and data has been loaded. Check the Manual Input tab.`);
            setActiveTab('manual');
            handleCancelPreview();
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown parsing error occurred.";
            setUploadError(message);
            setCsvPreview(null);
            setRawCsvContent(null);
        }
    }
  };

  const handleCancelPreview = () => {
      setFileName(null);
      setCsvPreview(null);
      setRawCsvContent(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement | null;
      if (fileInput) {
          fileInput.value = ''; // Reset file input to allow re-selection
      }
  };

  const renderManualInput = () => (
    <div className="space-y-6 animate-fade-in">
        <NameInputField
            label="Candidate Name"
            name="name"
            value={data.name}
            onChange={handleNameChange}
            error={errors.name}
            tooltip="Assign a unique name or identifier to this exoplanet candidate."
        />
        <InputField 
            label={`Orbital Period (${unitConfig.orbitalPeriod.label})`} 
            name="orbitalPeriod" 
            value={displayValues.orbitalPeriod} 
            onChange={handleInputChange} 
            min={unitConfig.orbitalPeriod.min} 
            max={unitConfig.orbitalPeriod.max} 
            step={unitConfig.orbitalPeriod.step} 
            error={errors.orbitalPeriod}
            tooltip="The time it takes for the planet to complete one orbit around its star. Affects the frequency of transits."
        />
        <InputField 
            label={`Transit Duration (${unitConfig.transitDuration.label})`} 
            name="transitDuration" 
            value={displayValues.transitDuration} 
            onChange={handleInputChange} 
            min={unitConfig.transitDuration.min} 
            max={unitConfig.transitDuration.max} 
            step={unitConfig.transitDuration.step} 
            error={errors.transitDuration} 
            tooltip="The length of time the star's light is dimmed during the planet's transit. Influenced by orbital speed and star size."
        />
        <InputField 
            label={`Planetary Radius (${unitConfig.planetaryRadius.label})`} 
            name="planetaryRadius" 
            value={displayValues.planetaryRadius} 
            onChange={handleInputChange} 
            min={unitConfig.planetaryRadius.min} 
            max={unitConfig.planetaryRadius.max} 
            step={unitConfig.planetaryRadius.step} 
            error={errors.planetaryRadius} 
            tooltip="The size of the planet. Larger planets block more starlight, creating a deeper transit dip in the light curve."
        />
        <InputField 
            label={`Stellar Temperature (${unitConfig.stellarTemperature.label})`} 
            name="stellarTemperature" 
            value={displayValues.stellarTemperature} 
            onChange={handleInputChange} 
            min={unitConfig.stellarTemperature.min} 
            max={unitConfig.stellarTemperature.max} 
            step={unitConfig.stellarTemperature.step} 
            error={errors.stellarTemperature} 
            tooltip="The surface temperature of the host star. This helps determine the star's type and the 'habitable zone'."
        />
    </div>
  );
  
  const renderFileUpload = () => (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-4 border-2 border-dashed border-slate-400 dark:border-slate-600 rounded-lg animate-fade-in">
        {csvPreview ? (
            <div className="w-full text-center">
                <h3 className="text-lg font-semibold text-amber-500 dark:text-amber-400 mb-2">File Preview</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">Confirm data from <span className="font-semibold text-amber-600 dark:text-amber-300">{fileName}</span></p>
                <div className="overflow-x-auto rounded-lg border border-slate-300 dark:border-slate-700 max-h-48">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                            <tr>
                                <th className="p-2">Name</th>
                                <th className="p-2">Period (d)</th>
                                <th className="p-2">Duration (h)</th>
                                <th className="p-2">Radius (R⊕)</th>
                                <th className="p-2">Temp (K)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-gray-200">
                            {csvPreview.map((row, index) => (
                                <tr key={index} className="border-t border-slate-300 dark:border-slate-700">
                                    <td className="p-2 font-sans truncate max-w-24" title={row.name}>{row.name}</td>
                                    <td className="p-2 font-mono">{row.orbitalPeriod}</td>
                                    <td className="p-2 font-mono">{row.transitDuration}</td>
                                    <td className="p-2 font-mono">{row.planetaryRadius}</td>
                                    <td className="p-2 font-mono">{row.stellarTemperature}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex gap-4 mt-6">
                    <button onClick={handleConfirmLoad} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        Load First Row
                    </button>
                    <button onClick={handleCancelPreview} className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        Cancel
                    </button>
                </div>
            </div>
        ) : (
            <>
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center text-center">
                    <UploadIcon className="w-12 h-12 text-amber-500 dark:text-amber-400 mb-4" />
                    <span className="font-semibold text-amber-500 dark:text-amber-400">Click to upload</span>
                    <p className="text-slate-500 dark:text-gray-400 text-xs mt-2">
                        CSV with optional headers. <br />
                        If no headers, data must be in this order: <br />
                        <code className="text-amber-600 dark:text-amber-300">orbitalPeriod, transitDuration, planetaryRadius, stellarTemperature</code>
                    </p>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv,.txt" />
                </label>
                {uploadError && (
                  <div className="mt-4 text-sm w-full text-red-500 dark:text-red-400 bg-red-200 dark:bg-red-900/50 p-3 rounded-lg border border-red-400 dark:border-red-500/50 text-center">
                    <span className="font-bold">Upload Failed:</span> {uploadError}
                  </div>
                )}
            </>
        )}
    </div>
  );
  
  const renderModelControls = () => {
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setHyperparameters(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    return (
        <div className="animate-fade-in space-y-4">
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
                Adjust the model's hyperparameters and initiate a retraining cycle. This simulates how a data scientist might fine-tune an AI to improve its performance.
            </p>
            <HyperparameterSlider
                label="Learning Rate"
                name="learningRate"
                value={hyperparameters.learningRate}
                min={0.0001}
                max={0.01}
                step={0.0001}
                onChange={handleSliderChange}
            />
            <HyperparameterSlider
                label="Epochs"
                name="epochs"
                value={hyperparameters.epochs}
                min={10}
                max={200}
                step={1}
                onChange={handleSliderChange}
            />
            <HyperparameterSlider
                label="Batch Size"
                name="batchSize"
                value={hyperparameters.batchSize}
                min={8}
                max={128}
                step={4}
                onChange={handleSliderChange}
            />
            <div className="pt-4">
                <button
                    onClick={onRetrain}
                    disabled={isRetraining}
                    className="w-full mt-2 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isRetraining ? (
                        <>
                            <RetrainSpinner />
                            Retraining Model...
                        </>
                    ) : (
                        'Retrain Model'
                    )}
                </button>
            </div>
        </div>
    );
  };

  const isFormInvalid = activeTab === 'manual' && Object.values(errors).some(Boolean);

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-amber-500/20 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-amber-500 dark:text-amber-400">Configuration &amp; Controls</h2>
      <div className="flex border-b border-slate-300 dark:border-slate-700 mb-6">
        <TabButton title="Manual Input" isActive={activeTab === 'manual'} onClick={() => setActiveTab('manual')} />
        <TabButton title="File Upload" isActive={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
        <TabButton title="Model Controls" isActive={activeTab === 'model'} onClick={() => setActiveTab('model')} />
      </div>
      <div>
        {activeTab === 'manual' && renderManualInput()}
        {activeTab === 'upload' && renderFileUpload()}
        {activeTab === 'model' && renderModelControls()}
      </div>
      {(activeTab === 'manual' || activeTab === 'upload') && (
        <button 
            onClick={onClassify}
            disabled={isFormInvalid}
            className="w-full mt-8 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-lg disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:text-gray-600 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:scale-100"
        >
            {isFormInvalid ? 'Please correct the invalid fields' : 'Classify Exoplanet Candidate'}
        </button>
      )}
    </div>
  );
};

interface NameInputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    tooltip: string;
}

const NameInputField: React.FC<NameInputFieldProps> = ({ label, name, value, onChange, error, tooltip }) => (
    <div>
        <div className="flex justify-between items-baseline mb-2">
            <div className="flex items-center gap-2 group relative">
                <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                    {label}
                </label>
                <InfoIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                <div className="absolute bottom-full mb-2 w-72 p-2 bg-slate-800 dark:bg-slate-900 border border-slate-600 dark:border-slate-700 text-gray-200 dark:text-gray-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                    {tooltip}
                </div>
            </div>
            {error && (
                <div id={`${name}-error`} role="alert" className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-xs text-right animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full bg-slate-100 dark:bg-slate-900/60 border rounded-lg py-2 px-3 text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300 ${
                error ? 'border-red-500/70 text-red-500 dark:text-red-400 ring-1 ring-red-500/50' : 'border-slate-400 dark:border-slate-600 focus:border-amber-500'
            }`}
            aria-label={`${label} value`}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
        />
    </div>
);

interface InputFieldProps {
    label: string;
    name: keyof ExoplanetData;
    value: number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    min: number;
    max: number;
    step: number;
    error?: string;
    tooltip: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, min, max, step, error, tooltip }) => (
    <div>
        <div className="flex justify-between items-baseline mb-2">
            <div className="flex items-center gap-2 group relative">
                {/* Fix: Explicitly cast `name` to string for htmlFor attribute */}
                <label htmlFor={String(name)} className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                    {label}
                </label>
                <InfoIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                <div className="absolute bottom-full mb-2 w-72 p-2 bg-slate-800 dark:bg-slate-900 border border-slate-600 dark:border-slate-700 text-gray-200 dark:text-gray-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                    {tooltip}
                </div>
            </div>
            {error && (
                // Fix: Explicitly cast `name` to string for template literal
                <div id={`${String(name)}-error`} role="alert" className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-xs text-right animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
        <div className="flex items-center gap-4">
            <input
                type="range"
                // Fix: Explicitly cast `name` to string for template literal
                id={`${String(name)}-range`}
                // Fix: Explicitly cast `name` to string for name attribute
                name={String(name)}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                step={step}
                className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                aria-label={`${label} slider`}
            />
            <input
                type="number"
                // Fix: Explicitly cast `name` to string for id attribute
                id={String(name)}
                // Fix: Explicitly cast `name` to string for name attribute
                name={String(name)}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                step={step}
                className={`w-32 text-center bg-slate-100 dark:bg-slate-900/60 border rounded-lg py-1 px-2 font-mono text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300 ${
                    error ? 'border-red-500/70 text-red-500 dark:text-red-400 ring-1 ring-red-500/50' : 'border-slate-400 dark:border-slate-600 focus:border-amber-500'
                }`}
                aria-label={`${label} value`}
                aria-invalid={!!error}
                // Fix: Explicitly cast `name` to string for template literal
                aria-describedby={error ? `${String(name)}-error` : undefined}
            />
        </div>
    </div>
);

interface TabButtonProps {
    title: string;
    isActive: boolean;
    onClick: () => void;
}
const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors duration-200 ${
            isActive ? 'border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
        }`}
    >
        {title}
    </button>
);

export default InputPanel;