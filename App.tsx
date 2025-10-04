// Fix: Create the main App component to structure the application.
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import ControlPanel from './components/ControlPanel';
import PerformancePanel from './components/PerformancePanel';
import SolarSystemAnimation from './components/SolarSystemAnimation';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import OpeningAnimation from './components/OpeningAnimation';
import { ExoplanetData, ClassificationResult, Hyperparameters, LightCurveDataPoint, ClassificationHistoryItem, ModelMetrics, KnownExoplanet } from './types';
import { DEFAULT_EXOPLANET_DATA, DEFAULT_HYPERPARAMETERS, MOCK_MODEL_METRICS, KNOWN_EXOPLANETS } from './constants';
import { classifyExoplanet } from './services/geminiService';

/**
 * Generates a simulated light curve with realistic noise and artifacts.
 * This is for visualization purposes and to create challenging data for the AI.
 */
function generateLightCurve(data: ExoplanetData, result: ClassificationResult): LightCurveDataPoint[] {
  const points = 200;
  const totalTime = data.transitDuration * 3;
  const transitStart = data.transitDuration;
  const transitEnd = data.transitDuration * 2;
  const curve: LightCurveDataPoint[] = [];

  // Realistic noise parameters
  const stellarVariabilityAmplitude = 0.0001 + Math.random() * 0.0003;
  const stellarVariabilityPeriod = totalTime / (2 + Math.random() * 3);
  const instrumentalDrift = (Math.random() - 0.5) * 0.0008; // Gentle slope

  if (result === ClassificationResult.FALSE_POSITIVE) {
    const artifactType = Math.random();
    // V-shaped dip for eclipsing binary
    if (artifactType < 0.4) { 
      for (let i = 0; i <= points; i++) {
        const time = (i / points) * totalTime;
        let flux = 1.0;
        // Add stellar variability and drift
        flux += Math.sin((time / stellarVariabilityPeriod) * 2 * Math.PI) * stellarVariabilityAmplitude;
        flux += (instrumentalDrift * time) / totalTime;
        
        // V-shaped dip
        if (time > transitStart && time < transitEnd) {
            const midPoint = transitStart + data.transitDuration / 2;
            const vDip = (0.005 + Math.random() * 0.01) * (1 - Math.abs(time - midPoint) / (data.transitDuration / 2));
            flux -= vDip;
        }
        flux += (Math.random() - 0.5) * 0.0005; // Base noise
        curve.push({ time: parseFloat(time.toFixed(2)), flux: parseFloat(flux.toFixed(5)) });
      }
    } 
    // Data spike artifact
    else if (artifactType < 0.7) {
        const spikeIndex = Math.floor(Math.random() * points);
        for (let i = 0; i <= points; i++) {
            const time = (i / points) * totalTime;
            let flux = 1.0;
            flux += Math.sin((time / stellarVariabilityPeriod) * 2 * Math.PI) * stellarVariabilityAmplitude;
            flux += (instrumentalDrift * time) / totalTime;
            
            if (i === spikeIndex) {
                flux += (Math.random() > 0.5 ? 1 : -1) * 0.003; // Random sharp spike/dip
            }
            flux += (Math.random() - 0.5) * 0.0005;
            curve.push({ time: parseFloat(time.toFixed(2)), flux: parseFloat(flux.toFixed(5)) });
        }
    }
    // Just noise, no significant event
    else {
        for (let i = 0; i <= points; i++) {
            const time = (i / points) * totalTime;
            let flux = 1.0;
            flux += Math.sin((time / stellarVariabilityPeriod) * 2 * Math.PI) * stellarVariabilityAmplitude;
            flux += (instrumentalDrift * time) / totalTime;
            flux += (Math.random() - 0.5) * 0.0005;
            curve.push({ time: parseFloat(time.toFixed(2)), flux: parseFloat(flux.toFixed(5)) });
        }
    }
    return curve;
  }

  // Logic for CONFIRMED, CANDIDATE, and NONE (for analysis)
  let dip = 0;
  let noiseLevel = 0.0005;

  if (result === ClassificationResult.CONFIRMED_EXOPLANET || result === ClassificationResult.PLANETARY_CANDIDATE || result === ClassificationResult.NONE) {
    dip = (data.planetaryRadius * data.planetaryRadius) / 1000;
  }

  if (result === ClassificationResult.PLANETARY_CANDIDATE) {
    // Candidates have lower signal-to-noise
    noiseLevel = 0.0008;
    dip *= 0.7; 
  }

  for (let i = 0; i <= points; i++) {
    const time = (i / points) * totalTime;
    let flux = 1.0;

    // Add realistic baseline variations
    flux += Math.sin((time / stellarVariabilityPeriod) * 2 * Math.PI) * stellarVariabilityAmplitude;
    flux += (instrumentalDrift * time) / totalTime;

    // Apply transit dip
    if (time > transitStart && time < transitEnd && dip > 0) {
      const ingressDuration = data.transitDuration * 0.1;
      const egressDuration = data.transitDuration * 0.1;

      if (time < transitStart + ingressDuration) {
        flux -= dip * ((time - transitStart) / ingressDuration);
      } else if (time > transitEnd - egressDuration) {
        flux -= dip * ((transitEnd - time) / egressDuration);
      } else {
        flux -= dip;
      }
    }

    // Add final random noise
    flux += (Math.random() - 0.5) * noiseLevel;
    
    curve.push({ time: parseFloat(time.toFixed(2)), flux: parseFloat(flux.toFixed(5)) });
  }

  return curve;
}


/**
 * Renders a light curve data array to a canvas and returns a base64 JPEG string.
 */
function lightCurveToImage(curveData: LightCurveDataPoint[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const width = 500;
        const height = 250;
        const padding = 40;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return reject(new Error("Could not create canvas context"));
        }

        // Background
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.fillRect(0, 0, width, height);

        // Find data bounds
        const times = curveData.map(d => d.time);
        const fluxes = curveData.map(d => d.flux);
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const minFlux = Math.min(...fluxes) - 0.0005;
        const maxFlux = Math.max(...fluxes) + 0.0005;

        // Scaling functions
        const scaleX = (time: number) => padding + ((time - minTime) / (maxTime - minTime)) * (width - 2 * padding);
        const scaleY = (flux: number) => padding + ((maxFlux - flux) / (maxFlux - minFlux)) * (height - 2 * padding);

        // Draw axes and labels
        ctx.strokeStyle = '#9ca3af'; // gray-400
        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px sans-serif';
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillText('Time (Hours)', width / 2, height - 10);
        
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Relative Flux', -height / 2, 15);
        ctx.restore();

        // Draw line
        ctx.strokeStyle = '#f59e0b'; // amber-500
        ctx.lineWidth = 2;
        ctx.beginPath();
        curveData.forEach((point, index) => {
            const x = scaleX(point.time);
            const y = scaleY(point.flux);
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
        resolve(base64Image);
    });
}

/**
 * Checks if the given exoplanet data matches a known exoplanet from the database.
 */
function checkForKnownExoplanet(data: ExoplanetData): KnownExoplanet | null {
  const periodTolerance = 0.05; // 5%
  const radiusTolerance = 0.10; // 10%
  const tempTolerance = 0.10; // 10%

  for (const knownPlanet of KNOWN_EXOPLANETS) {
    const knownData = knownPlanet.data;
    const periodMatch = Math.abs(knownData.orbitalPeriod - data.orbitalPeriod) / knownData.orbitalPeriod < periodTolerance;
    const radiusMatch = Math.abs(knownData.planetaryRadius - data.planetaryRadius) / knownData.planetaryRadius < radiusTolerance;
    const tempMatch = Math.abs(knownData.stellarTemperature - data.stellarTemperature) / knownData.stellarTemperature < tempTolerance;

    if (periodMatch && radiusMatch && tempMatch) {
      return knownPlanet;
    }
  }

  return null;
}


const App: React.FC = () => {
    const [showAnimation, setShowAnimation] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [data, setData] = useState<ExoplanetData>(DEFAULT_EXOPLANET_DATA);
    const [hyperparameters, setHyperparameters] = useState<Hyperparameters>(DEFAULT_HYPERPARAMETERS);
    const [result, setResult] = useState<ClassificationResult>(ClassificationResult.NONE);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRetraining, setIsRetraining] = useState<boolean>(false);
    const [modelMetrics, setModelMetrics] = useState<ModelMetrics>(MOCK_MODEL_METRICS);
    const [lightCurveData, setLightCurveData] = useState<LightCurveDataPoint[]>([]);
    const [activeView, setActiveView] = useState<'dashboard' | 'profile'>('dashboard');
    const [history, setHistory] = useState<ClassificationHistoryItem[]>([]);
    const [classificationError, setClassificationError] = useState<string | null>(null);
    const [crossReferenceResult, setCrossReferenceResult] = useState<{ name: string; fact: string } | null>(null);


    useEffect(() => {
        // This effect now primarily updates the UI after classification is complete.
        setLightCurveData(generateLightCurve(data, result));
    }, [data, result]);

    const handleClassify = async () => {
        setIsLoading(true);
        setResult(ClassificationResult.NONE);
        setClassificationError(null);
        setCrossReferenceResult(null);
        try {
            // 1. Generate a representative light curve for analysis
            const curveForAnalysis = generateLightCurve(data, ClassificationResult.NONE);
            
            // 2. Convert the curve to an image
            const lightCurveImage = await lightCurveToImage(curveForAnalysis);

            // 3. Send the image and data for classification
            const classification = await classifyExoplanet(data, lightCurveImage);
            setResult(classification);
            
            // 4. Cross-reference with database if it's a potential planet
            if (classification === ClassificationResult.CONFIRMED_EXOPLANET || classification === ClassificationResult.PLANETARY_CANDIDATE) {
                const match = checkForKnownExoplanet(data);
                if (match) {
                    setCrossReferenceResult(match);
                } else {
                    setCrossReferenceResult({
                        name: "Potentially New Discovery!",
                        fact: "This candidate's parameters do not match any known exoplanets in our current database. This could be a novel finding."
                    });
                }
            }


            const newHistoryItem: ClassificationHistoryItem = {
              id: new Date().toISOString(),
              timestamp: new Date().toLocaleString(),
              data: data,
              result: classification,
            };
            setHistory(prevHistory => [newHistoryItem, ...prevHistory]);

        } catch (error) {
            console.error("Classification failed:", error);
            setResult(ClassificationResult.NONE);
            setClassificationError("An error occurred during classification. The AI model could not analyze the data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetrain = () => {
        console.log("Retraining with hyperparameters:", hyperparameters);
        setIsRetraining(true);
        
        setTimeout(() => {
            // Simulate model metrics changing after retraining
            const newMetrics: ModelMetrics = {
                accuracy: Math.min(0.99, modelMetrics.accuracy + (Math.random() - 0.45) * 0.03),
                precision: Math.min(0.99, modelMetrics.precision + (Math.random() - 0.45) * 0.03),
                recall: Math.min(0.99, modelMetrics.recall + (Math.random() - 0.45) * 0.03),
                f1Score: Math.min(0.99, modelMetrics.f1Score + (Math.random() - 0.45) * 0.03),
            };
            setModelMetrics(newMetrics);
            setIsRetraining(false);
            alert("Model retraining complete! Performance metrics have been updated.");
        }, 3000);
    };

    const handleLogin = () => {
      setIsLoggedIn(true);
    };
    
    if (showAnimation) {
      return <OpeningAnimation onAnimationEnd={() => setShowAnimation(false)} />;
    }

    return (
        <div className="bg-slate-900 text-white min-h-screen font-sans overflow-x-hidden">
            {isLoggedIn && <SolarSystemAnimation />}
            <div className="relative z-10">
              {!isLoggedIn ? (
                <LoginPage onLogin={handleLogin} />
              ) : (
                <div className="container mx-auto px-4 py-8">
                    <Header activeView={activeView} setActiveView={setActiveView} />
                    {activeView === 'dashboard' ? (
                      <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-1 flex flex-col gap-8">
                              <InputPanel data={data} setData={setData} onClassify={handleClassify} />
                              <ControlPanel hyperparameters={hyperparameters} setHyperparameters={setHyperparameters} onRetrain={handleRetrain} isRetraining={isRetraining} />
                          </div>
                          <div className="lg:col-span-2 flex flex-col gap-8">
                              <ResultsPanel isLoading={isLoading} result={result} lightCurveData={lightCurveData} error={classificationError} crossReferenceResult={crossReferenceResult} />
                              <PerformancePanel isRetraining={isRetraining} metrics={modelMetrics} />
                          </div>
                      </main>
                    ) : (
                      <ProfilePage history={history} />
                    )}
                </div>
              )}
            </div>
        </div>
    );
};

export default App;