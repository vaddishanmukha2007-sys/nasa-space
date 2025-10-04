import React, { useState, ChangeEvent } from 'react';
import type { ExoplanetData } from '../types';
import { parseExoplanetCsv, previewExoplanetCsv } from '../utils/csvParser';

interface InputPanelProps {
  data: ExoplanetData;
  setData: React.Dispatch<React.SetStateAction<ExoplanetData>>;
  onClassify: () => void;
}

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


const InputPanel: React.FC<InputPanelProps> = ({ data, setData, onClassify }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<ExoplanetData[] | null>(null);
  const [rawCsvContent, setRawCsvContent] = useState<string | null>(null);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: parseFloat(e.target.value) || 0 });
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
        <InputField label="Orbital Period (days)" name="orbitalPeriod" value={data.orbitalPeriod} onChange={handleInputChange} min={0.1} max={10000} step={0.1} />
        <InputField label="Transit Duration (hours)" name="transitDuration" value={data.transitDuration} onChange={handleInputChange} min={0.1} max={24} step={0.1} />
        <InputField label="Planetary Radius (Earth radii)" name="planetaryRadius" value={data.planetaryRadius} onChange={handleInputChange} min={0.1} max={20} step={0.01} />
        <InputField label="Stellar Temperature (K)" name="stellarTemperature" value={data.stellarTemperature} onChange={handleInputChange} min={2000} max={10000} step={10} />
    </div>
  );
  
  const renderFileUpload = () => (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-4 border-2 border-dashed border-slate-600 rounded-lg animate-fade-in">
        {csvPreview ? (
            <div className="w-full text-center">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">File Preview</h3>
                <p className="text-sm text-gray-400 mb-4">Confirm data from <span className="font-semibold text-amber-300">{fileName}</span></p>
                <div className="overflow-x-auto rounded-lg border border-slate-700 max-h-48">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-700/50 text-gray-300 uppercase tracking-wider">
                            <tr>
                                <th className="p-2">Period (d)</th>
                                <th className="p-2">Duration (h)</th>
                                <th className="p-2">Radius (R⊕)</th>
                                <th className="p-2">Temp (K)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800/50 text-gray-200">
                            {csvPreview.map((row, index) => (
                                <tr key={index} className="border-t border-slate-700">
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
                    <button onClick={handleCancelPreview} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        Cancel
                    </button>
                </div>
            </div>
        ) : (
            <>
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center text-center">
                    <UploadIcon className="w-12 h-12 text-amber-400 mb-4" />
                    <span className="font-semibold text-amber-400">Click to upload</span>
                    <p className="text-gray-400 text-xs mt-2">
                        CSV with headers: <br />
                        <code className="text-amber-300">orbitalPeriod, transitDuration, planetaryRadius, stellarTemperature</code>
                    </p>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv,.txt" />
                </label>
                {uploadError && (
                  <div className="mt-4 text-sm w-full text-red-400 bg-red-900/50 p-3 rounded-lg border border-red-500/50 text-center">
                    <span className="font-bold">Upload Failed:</span> {uploadError}
                  </div>
                )}
            </>
        )}
    </div>
  );

  return (
    <div className="bg-slate-800/50 border border-amber-500/20 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-amber-400">Data Input</h2>
      <div className="flex border-b border-slate-700 mb-6">
        <TabButton title="Manual Input" isActive={activeTab === 'manual'} onClick={() => setActiveTab('manual')} />
        <TabButton title="File Upload" isActive={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
      </div>
      <div>
        {activeTab === 'manual' ? renderManualInput() : renderFileUpload()}
      </div>
      <button 
        onClick={onClassify}
        className="w-full mt-8 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-lg"
      >
        Classify Exoplanet Candidate
      </button>
    </div>
  );
};


interface InputFieldProps {
    label: string;
    name: keyof ExoplanetData;
    value: number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    min: number;
    max: number;
    step: number;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, min, max, step }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
            <span>{label}</span>
            <span className="text-amber-400 font-mono">{value}</span>
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

interface TabButtonProps {
    title: string;
    isActive: boolean;
    onClick: () => void;
}
const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors duration-200 ${
            isActive ? 'border-amber-400 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
        }`}
    >
        {title}
    </button>
);

export default InputPanel;