// Fix: Define all necessary types for the application.

export interface ExoplanetData {
  name: string;
  orbitalPeriod: number;      // Base unit: days
  transitDuration: number;    // Base unit: hours
  planetaryRadius: number;    // Base unit: Earth radii
  stellarTemperature: number; // Base unit: Kelvin
}

export interface Hyperparameters {
  learningRate: number;
  epochs: number;
  batchSize: number;
}

export interface ModelMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
}

export enum ClassificationResult {
  CONFIRMED_EXOPLANET = 'CONFIRMED_EXOPLANET',
  PLANETARY_CANDIDATE = 'PLANETARY_CANDIDATE',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
}

export interface ClassificationHistoryItem {
  id: string;
  timestamp: string;
  data: ExoplanetData;
  result: ClassificationResult;
}

export interface YearlyArchiveData {
    year: number;
    totalClassifications: number;
    confirmedExoplanets: number;
    planetaryCandidates: number;
    falsePositives: number;
}

// New types for NASA Cross-Reference Feature
export interface NasaExoplanet extends ExoplanetData {
  discoveryYear: number;
}

export type CrossReferenceResult = NasaExoplanet | 'no_match' | null;