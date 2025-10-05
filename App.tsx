import React, { useState, useEffect, useRef } from 'react';
// Fix: Add file extension to resolve module.
import type { ExoplanetData, ClassificationResult, ClassificationHistoryItem, CrossReferenceResult, Hyperparameters, ModelMetrics } from './types.ts';
// Fix: Add file extension to resolve module.
import { DEFAULT_EXOPLANET_DATA, RECENT_NASA_EXOPLANETS, DEFAULT_HYPERPARAMETERS, MOCK_MODEL_METRICS } from './constants.ts';
// Fix: Add file extension to resolve module.
import { classifyExoplanet } from './services/geminiService.ts';
// Fix: Add file extension to resolve module.
import Header from './components/Header.tsx';
// Fix: Add file extension to resolve module.
import InputPanel from './components/InputPanel.tsx';
// Fix: Add file extension to resolve module.
import ResultsPanel from './components/ResultsPanel.tsx';
// Fix: Add file extension to resolve module.
import OpeningAnimation from './components/OpeningAnimation.tsx';
// Fix: Add file extension to resolve module.
import LoginPage from './components/LoginPage.tsx';
// Fix: Add file extension to resolve module.
import ProfilePage from './components/ProfilePage.tsx';
// Fix: Add file extension to resolve module.
import ArchivePanel from './components/ArchivePanel.tsx';
// Fix: Add file extension to resolve module.
import SettingsModal from './components/SettingsModal.tsx';
// Fix: Add file extension to resolve module.
import ChatButton from './components/ChatButton.tsx';
// Fix: Add file extension to resolve module.
import ChatModal from './components/ChatModal.tsx';
// Fix: Add file extension to resolve module.
import { useSettings } from './contexts/SettingsContext.tsx';
import FascinatingFact from './components/FascinatingFact.tsx';
import VisualsPanel from './components/VisualsPanel.tsx';

const App: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [data, setData] = useState<ExoplanetData>(DEFAULT_EXOPLANET_DATA);

  const [isLoading, setIsLoading] = useState(false);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [crossReferenceResult, setCrossReferenceResult] = useState<CrossReferenceResult>(null);
  const [history, setHistory] = useState<ClassificationHistoryItem[]>([]);

  const [activeView, setActiveView] = useState<'dashboard' | 'profile' | 'archive'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [hyperparameters, setHyperparameters] = useState<Hyperparameters>(DEFAULT_HYPERPARAMETERS);
  const [metrics, setMetrics] = useState<ModelMetrics>(MOCK_MODEL_METRICS);
  const [isRetraining, setIsRetraining] = useState(false);

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

  const handleReset = () => {
    setData(DEFAULT_EXOPLANET_DATA);
    setClassificationResult(null);
    setCrossReferenceResult(null);
    setIsLoading(false);
  };
  
  const handleLogin = () => {
      setIsLoggedIn(true);
  };

  const handleRetrain = () => {
    setIsRetraining(true);
    console.log("Retraining with hyperparameters:", hyperparameters);
    // Simulate a network request for retraining
    setTimeout(() => {
        // Simulate receiving new metrics that are slightly different
        const newMetrics: ModelMetrics = {
            accuracy: Math.min(0.99, metrics.accuracy + (Math.random() - 0.4) * 0.02),
            precision: Math.min(0.99, metrics.precision + (Math.random() - 0.4) * 0.02),
            recall: Math.min(0.99, metrics.recall + (Math.random() - 0.4) * 0.02),
            f1Score: Math.min(0.99, metrics.f1Score + (Math.random() - 0.4) * 0.02),
        };
        setMetrics(newMetrics);
        setIsRetraining(false);
    }, 2500); // Simulate 2.5 second training time
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
                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8 animate-fade-in">
                  {/* Left Column (Inputs & Quick Info) */}
                  <div className="lg:col-span-2 space-y-8">
                    <InputPanel
                      data={data}
                      setData={setData}
                      onClassify={handleClassify}
                      hyperparameters={hyperparameters}
                      setHyperparameters={setHyperparameters}
                      onRetrain={handleRetrain}
                      isRetraining={isRetraining}
                    />
                     <FascinatingFact 
                      data={data}
                      classificationResult={classificationResult}
                    />
                  </div>
                   {/* Right Column (Results & Visualizations) */}
                  <div className="lg:col-span-3 space-y-8">
                    <ResultsPanel
                      isLoading={isLoading}
                      classificationResult={classificationResult}
                      data={data}
                      crossReferenceResult={crossReferenceResult}
                      onReset={handleReset}
                    />
                    <VisualsPanel data={data} metrics={metrics} />
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