import React, { useState, useEffect, useRef } from 'react';
import type { ExoplanetData, Hyperparameters, ModelMetrics, ClassificationResult, ClassificationHistoryItem, CrossReferenceResult } from './types.ts';
import { DEFAULT_EXOPLANET_DATA, DEFAULT_HYPERPARAMETERS, MOCK_MODEL_METRICS, RECENT_NASA_EXOPLANETS } from './constants.ts';
import { classifyExoplanet } from './services/geminiService';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ControlPanel from './components/ControlPanel';
import ResultsPanel from './components/ResultsPanel';
import PerformancePanel from './components/PerformancePanel';
import OpeningAnimation from './components/OpeningAnimation';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import ArchivePanel from './components/ArchivePanel';
import SettingsModal from './components/SettingsModal';
import ChatButton from './components/ChatButton';
import ChatModal from './components/ChatModal';
import { useSettings } from './contexts/SettingsContext';

const App: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [data, setData] = useState<ExoplanetData>(DEFAULT_EXOPLANET_DATA);
  const [hyperparameters, setHyperparameters] = useState<Hyperparameters>(DEFAULT_HYPERPARAMETERS);
  const [metrics, setMetrics] = useState<ModelMetrics>(MOCK_MODEL_METRICS);

  const [isLoading, setIsLoading] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [crossReferenceResult, setCrossReferenceResult] = useState<CrossReferenceResult>(null);
  const [history, setHistory] = useState<ClassificationHistoryItem[]>([]);

  const [activeView, setActiveView] = useState<'dashboard' | 'profile' | 'archive'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const { theme } = useSettings();
  const lightCurveCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate Light Curve Image for Gemini
  const generateLightCurveImage = (canvas: HTMLCanvasElement, exoplanetData: ExoplanetData) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    
    // Theme-aware colors
    const bgColor = theme === 'dark' ? '#1e293b' : '#ffffff';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
    const textColor = theme === 'dark' ? '#9ca3af' : '#475569';
    const lineColor = theme === 'dark' ? '#f59e0b' : '#f97316';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 10; i++) {
        const y = padding + i * (height - 2 * padding) / 10;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    // Draw Axes and Labels
    ctx.fillStyle = textColor;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (hours)', width / 2, height - 10);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Relative Flux', -height / 2, 15);
    ctx.restore();
    
    // Simulate transit data points
    const numPoints = 200;
    const points = [];
    const transitStart = (numPoints / 2) - (exoplanetData.transitDuration * (numPoints / 48)); // Center the transit
    const transitEnd = transitStart + (exoplanetData.transitDuration * (numPoints / 48));
    const transitDepth = Math.min(0.1, (exoplanetData.planetaryRadius / 10) ** 2); // Simplified depth

    for (let i = 0; i < numPoints; i++) {
        let flux = 1.0;
        if (i > transitStart && i < transitEnd) {
            flux = 1.0 - transitDepth;
        }
        // Add realistic noise
        flux += (Math.random() - 0.5) * 0.005;
        points.push(flux);
    }
    
    // Draw Line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < numPoints; i++) {
        const x = padding + (i / (numPoints - 1)) * (width - 2 * padding);
        const y = padding + (1.02 - points[i]) * (height - 2 * padding) / 0.04;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
  };

  const crossReferenceWithNasaData = (userInput: ExoplanetData): void => {
      const TOLERANCE = 0.025; // 2.5% tolerance for key parameters

      const foundMatch = RECENT_NASA_EXOPLANETS.find(nasaPlanet => {
          const periodMatch = Math.abs(nasaPlanet.orbitalPeriod - userInput.orbitalPeriod) / nasaPlanet.orbitalPeriod <= TOLERANCE;
          const radiusMatch = Math.abs(nasaPlanet.planetaryRadius - userInput.planetaryRadius) / nasaPlanet.planetaryRadius <= TOLERANCE;
          const tempMatch = Math.abs(nasaPlanet.stellarTemperature - userInput.stellarTemperature) / nasaPlanet.stellarTemperature <= TOLERANCE;
          // Transit duration can be more variable, so we use a wider tolerance
          const durationMatch = Math.abs(nasaPlanet.transitDuration - userInput.transitDuration) / nasaPlanet.transitDuration <= (TOLERANCE * 2);

          return periodMatch && radiusMatch && tempMatch && durationMatch;
      });

      if (foundMatch) {
          setCrossReferenceResult(foundMatch);
      } else {
          setCrossReferenceResult('no_match');
      }
  };

  const handleClassify = async () => {
    setIsLoading(true);
    setClassificationResult(null);
    setCrossReferenceResult(null); // Reset on new classification
    
    // Ensure canvas exists and generate image
    if (!lightCurveCanvasRef.current) {
        setIsLoading(false);
        console.error("Canvas element not found");
        return;
    }
    generateLightCurveImage(lightCurveCanvasRef.current, data);
    const lightCurveImage = lightCurveCanvasRef.current.toDataURL('image/jpeg');

    try {
      const result = await classifyExoplanet(data, lightCurveImage);
      setClassificationResult(result);
      crossReferenceWithNasaData(data); // Perform cross-reference after classification

      // Add to history
      const newHistoryItem: ClassificationHistoryItem = {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toLocaleString(),
        data: { ...data },
        result: result,
      };
      setHistory(prev => [newHistoryItem, ...prev]);

    } catch (error) {
      console.error("Classification failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrain = () => {
    setIsRetraining(true);
    // Simulate retraining time
    setTimeout(() => {
      // Simulate slight metric changes after retraining
      const newMetrics = {
        accuracy: Math.min(0.99, MOCK_MODEL_METRICS.accuracy + (Math.random() - 0.5) * 0.02),
        precision: Math.min(0.99, MOCK_MODEL_METRICS.precision + (Math.random() - 0.5) * 0.02),
        recall: Math.min(0.99, MOCK_MODEL_METRICS.recall + (Math.random() - 0.5) * 0.02),
        f1Score: Math.min(0.99, MOCK_MODEL_METRICS.f1Score + (Math.random() - 0.5) * 0.02),
      };
      setMetrics(newMetrics);
      setIsRetraining(false);
    }, 2500);
  };

  const handleReset = () => {
    setData(DEFAULT_EXOPLANET_DATA);
    setHyperparameters(DEFAULT_HYPERPARAMETERS);
    setClassificationResult(null);
    setCrossReferenceResult(null);
    setIsLoading(false);
  };
  
  const handleLogin = () => {
      setIsLoggedIn(true);
  };

  if (showAnimation) {
    return <OpeningAnimation onAnimationEnd={() => setShowAnimation(false)} />;
  }

  if (!isLoggedIn) {
      return <LoginPage onLogin={handleLogin} />;
  }

  const renderView = () => {
      switch(activeView) {
          case 'profile':
              return <ProfilePage history={history} />;
          case 'archive':
              return <ArchivePanel />;
          case 'dashboard':
          default:
              return (
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 animate-fade-in">
                  <div className="lg:col-span-1 space-y-8">
                    <InputPanel data={data} setData={setData} onClassify={handleClassify} />
                    <ControlPanel 
                      hyperparameters={hyperparameters} 
                      setHyperparameters={setHyperparameters} 
                      onRetrain={handleRetrain} 
                      isRetraining={isRetraining} 
                    />
                  </div>
                  <div className="lg:col-span-2 space-y-8">
                    <ResultsPanel
                      isLoading={isLoading}
                      classificationResult={classificationResult}
                      data={data}
                      crossReferenceResult={crossReferenceResult}
                      onReset={handleReset}
                    />
                    <PerformancePanel isRetraining={isRetraining} metrics={metrics} />
                  </div>
                </main>
              );
      }
  }

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-500 text-slate-800 dark:text-gray-200 font-sans`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Header 
          activeView={activeView} 
          setActiveView={setActiveView}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        {renderView()}
        <canvas ref={lightCurveCanvasRef} width="500" height="300" style={{ display: 'none' }}></canvas>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ChatButton onClick={() => setIsChatOpen(true)} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default App;