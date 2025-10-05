import React, { useState, useEffect, useCallback } from 'react';
import { ClassificationResult, type ExoplanetData, type LightCurveDataPoint, type ModelMetrics, type Hyperparameters, type ClassificationHistoryItem } from './types';
import { DEFAULT_EXOPLANET_DATA, DEFAULT_HYPERPARAMETERS, MOCK_MODEL_METRICS, KNOWN_EXOPLANETS } from './constants';
import { classifyExoplanet } from './services/geminiService';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import ControlPanel from './components/ControlPanel';
import PerformancePanel from './components/PerformancePanel';
import SettingsModal from './components/SettingsModal';
import SolarSystemAnimation from './components/SolarSystemAnimation';
import LoginPage from './components/LoginPage';
import OpeningAnimation from './components/OpeningAnimation';
import ProfilePage from './components/ProfilePage';
import ArchivePanel from './components/ArchivePanel';
import ChatButton from './components/ChatButton';
import ChatModal from './components/ChatModal';

type View = 'dashboard' | 'profile' | 'archive';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true);

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [data, setData] = useState<ExoplanetData>(DEFAULT_EXOPLANET_DATA);
  const [hyperparameters, setHyperparameters] = useState<Hyperparameters>(DEFAULT_HYPERPARAMETERS);
  const [metrics, setMetrics] = useState<ModelMetrics>(MOCK_MODEL_METRICS);

  const [isLoading, setIsLoading] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<ClassificationResult>(ClassificationResult.NONE);
  const [lightCurveData, setLightCurveData] = useState<LightCurveDataPoint[]>([]);
  const [crossReferenceResult, setCrossReferenceResult] = useState<{ name: string; fact: string } | null>(null);
  const [history, setHistory] = useState<ClassificationHistoryItem[]>([]);

  const generateLightCurveData = useCallback((params: ExoplanetData): LightCurveDataPoint[] => {
    const points: LightCurveDataPoint[] = [];
    const totalDuration = Math.max(24, params.transitDuration * 2);
    const numPoints = 500;
    const transitStart = (totalDuration - params.transitDuration) / 2;
    const transitEnd = transitStart + params.transitDuration;
    const dipDepth = Math.pow(params.planetaryRadius / 11.2, 2) * 0.05;

    for (let i = 0; i < numPoints; i++) {
      const time = (i / numPoints) * totalDuration;
      let flux = 1.0;
      const noise = (Math.random() - 0.5) * 0.0005;

      if (time >= transitStart && time <= transitEnd) {
        flux -= dipDepth;
      }
      points.push({ time, flux: flux + noise });
    }
    return points;
  }, []);
  
  const generateLightCurveImageBase64 = (points: LightCurveDataPoint[], theme: 'light' | 'dark'): string => {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 250;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      const bgColor = theme === 'dark' ? '#1e293b' : '#ffffff';
      const fgColor = theme === 'dark' ? '#e2e8f0' : '#1e293b';
      const lineColor = '#f59e0b';
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const padding = 40;
      const plotWidth = canvas.width - padding * 2;
      const plotHeight = canvas.height - padding * 2;
      
      const minFlux = Math.min(...points.map(p => p.flux)) - 0.001;
      const maxFlux = Math.max(...points.map(p => p.flux)) + 0.001;
      const maxTime = Math.max(...points.map(p => p.time));
      
      // Draw axes
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, canvas.height - padding);
      ctx.lineTo(canvas.width - padding, canvas.height - padding);
      ctx.stroke();

      // Draw line
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((point, index) => {
          const x = padding + (point.time / maxTime) * plotWidth;
          const y = padding + (1 - (point.flux - minFlux) / (maxFlux - minFlux)) * plotHeight;
          if (index === 0) {
              ctx.moveTo(x, y);
          } else {
              ctx.lineTo(x, y);
          }
      });
      ctx.stroke();
      
      return canvas.toDataURL('image/jpeg');
  };

  const crossReferenceWithKnownExoplanets = (inputData: ExoplanetData): { name: string; fact: string } | null => {
      let bestMatch: { planet: (typeof KNOWN_EXOPLANETS)[0]; score: number } | null = null;

      for (const planet of KNOWN_EXOPLANETS) {
          const periodDiff = Math.abs(planet.data.orbitalPeriod - inputData.orbitalPeriod) / planet.data.orbitalPeriod;
          const radiusDiff = Math.abs(planet.data.planetaryRadius - inputData.planetaryRadius) / planet.data.planetaryRadius;
          const tempDiff = Math.abs(planet.data.stellarTemperature - inputData.stellarTemperature) / planet.data.stellarTemperature;
          
          const score = (periodDiff + radiusDiff + tempDiff) / 3;

          if (score < 0.15 && (!bestMatch || score < bestMatch.score)) {
              bestMatch = { planet, score };
          }
      }

      if (bestMatch) {
          return { name: bestMatch.planet.name, fact: bestMatch.planet.fact };
      }
      return {
          name: "Potentially New Discovery!",
          fact: "The input parameters do not closely match any known exoplanets in our simplified database. This could represent a new candidate worthy of further investigation."
      };
  };

  const handleClassify = async () => {
    setIsLoading(true);
    setError(null);
    setResult(ClassificationResult.NONE);
    setCrossReferenceResult(null);

    try {
      const generatedLightCurve = generateLightCurveData(data);
      setLightCurveData(generatedLightCurve);
      
      // Use a timeout to allow the UI to update before generating the image
      setTimeout(async () => {
        const imageBase64 = generateLightCurveImageBase64(generatedLightCurve, 'dark'); // Assuming dark theme for generation
        if (!imageBase64) {
            throw new Error("Could not generate light curve image.");
        }
        
        const classification = await classifyExoplanet(data, imageBase64);
        setResult(classification);

        if (classification === ClassificationResult.CONFIRMED_EXOPLANET || classification === ClassificationResult.PLANETARY_CANDIDATE) {
            const crossRef = crossReferenceWithKnownExoplanets(data);
            setCrossReferenceResult(crossRef);
        }

        const newHistoryItem: ClassificationHistoryItem = {
          id: new Date().toISOString(),
          timestamp: new Date().toLocaleString(),
          data: data,
          result: classification,
        };
        setHistory(prev => [newHistoryItem, ...prev]);

      }, 100);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred during classification.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      // Simulate new metrics after retraining
      const newMetrics: ModelMetrics = {
        accuracy: Math.min(0.99, metrics.accuracy + (Math.random() - 0.4) * 0.02),
        precision: Math.min(0.99, metrics.precision + (Math.random() - 0.4) * 0.02),
        recall: Math.min(0.99, metrics.recall + (Math.random() - 0.4) * 0.02),
        f1Score: Math.min(0.99, metrics.f1Score + (Math.random() - 0.4) * 0.02),
      };
      setMetrics(newMetrics);
      setIsRetraining(false);
    }, 2500);
  };
  
  const handleAnimationEnd = () => {
      setShowOpeningAnimation(false);
  };

  const handleLogin = () => {
      setIsLoggedIn(true);
  };

  useEffect(() => {
    setLightCurveData(generateLightCurveData(data));
  }, [data, generateLightCurveData]);


  if (showOpeningAnimation) {
    return <OpeningAnimation onAnimationEnd={handleAnimationEnd} />;
  }

  if (!isLoggedIn) {
      return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-gray-200 font-sans transition-colors duration-500 relative isolate">
        <SolarSystemAnimation />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <Header activeView={activeView} setActiveView={setActiveView} onOpenSettings={() => setIsSettingsOpen(true)} />
            
            {activeView === 'dashboard' && (
              <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                  <div className="space-y-8">
                      <InputPanel data={data} setData={setData} onClassify={handleClassify} />
                      <ControlPanel hyperparameters={hyperparameters} setHyperparameters={setHyperparameters} onRetrain={handleRetrain} isRetraining={isRetraining}/>
                  </div>
                  <div className="space-y-8">
                      <ResultsPanel 
                        isLoading={isLoading} 
                        result={result} 
                        lightCurveData={lightCurveData} 
                        error={error}
                        crossReferenceResult={crossReferenceResult}
                        data={data}
                      />
                      <PerformancePanel isRetraining={isRetraining} metrics={metrics}/>
                  </div>
              </main>
            )}

            {activeView === 'profile' && <ProfilePage history={history} />}
            {activeView === 'archive' && <ArchivePanel />}
        </div>
        
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <ChatButton onClick={() => setIsChatOpen(true)} />
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default App;