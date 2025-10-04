export interface ExoplanetData {
  orbitalPeriod: number;
  transitDuration: number;
  planetaryRadius: number;
  stellarTemperature: number;
}

export enum ClassificationResult {
  CONFIRMED_EXOPLANET = "CONFIRMED_EXOPLANET",
  PLANETARY_CANDIDATE = "PLANETARY_CANDIDATE",
  FALSE_POSITIVE = "FALSE_POSITIVE",
  NONE = "NONE",
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface Hyperparameters {
  learningRate: number;
  maxDepth: number;
  nEstimators: number;
}

export interface LightCurveDataPoint {
  time: number;
  flux: number;
}

export interface ClassificationHistoryItem {
  id: string;
  timestamp: string;
  data: ExoplanetData;
  result: ClassificationResult;
}

export interface KnownExoplanet {
  name: string;
  data: ExoplanetData;
  fact: string;
}

export interface YearlyArchiveData {
  year: number;
  totalClassifications: number;
  confirmedExoplanets: number;
  planetaryCandidates: number;
  falsePositives: number;
}
