// Fix: Define all necessary constants for the application.

import { ClassificationResult, YearlyArchiveData, ExoplanetData, NasaExoplanet, Hyperparameters, ModelMetrics } from './types.ts';

export const DEFAULT_EXOPLANET_DATA: ExoplanetData = {
  name: 'Kepler-186 f (Default)',
  orbitalPeriod: 365.25, // days
  transitDuration: 4,    // hours
  planetaryRadius: 1.0,  // Earth radii
  stellarTemperature: 5778, // Kelvin (Sun's temp)
};

export const DEFAULT_HYPERPARAMETERS: Hyperparameters = {
  learningRate: 0.001,
  epochs: 50,
  batchSize: 32,
};

export const MOCK_MODEL_METRICS: ModelMetrics = {
  accuracy: 0.963,
  precision: 0.941,
  recall: 0.975,
  f1Score: 0.958,
};

export const MOCK_DETAILED_METRICS = [
    { name: 'Accuracy', value: MOCK_MODEL_METRICS.accuracy, fill: '#8884d8' },
    { name: 'Precision', value: MOCK_MODEL_METRICS.precision, fill: '#82ca9d' },
    { name: 'Recall', value: MOCK_MODEL_METRICS.recall, fill: '#ffc658' },
    { name: 'F1-Score', value: MOCK_MODEL_METRICS.f1Score, fill: '#ff8042' },
];

export const MOCK_CONFUSION_MATRIX = [
    [1250, 30], // True Neg, False Pos
    [10, 390],  // False Neg, True Pos
];


export const CLASSIFICATION_DETAILS: { [key in ClassificationResult]: { label: string; color: string; description: string } } = {
  [ClassificationResult.CONFIRMED_EXOPLANET]: {
    label: 'Confirmed Exoplanet',
    color: 'bg-green-200 text-green-800 dark:bg-green-900/70 dark:text-green-300 border-green-400 dark:border-green-500/50',
    description: 'The model has identified a strong, unambiguous transit signal consistent with an exoplanet orbiting its star.',
  },
  [ClassificationResult.PLANETARY_CANDIDATE]: {
    label: 'Planetary Candidate',
    color: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-300 border-yellow-400 dark:border-yellow-500/50',
    description: 'A potential transit signal was detected, but it contains some ambiguity or noise. Further observation is recommended.',
  },
  [ClassificationResult.FALSE_POSITIVE]: {
    label: 'False Positive',
    color: 'bg-red-200 text-red-800 dark:bg-red-900/70 dark:text-red-300 border-red-400 dark:border-red-500/50',
    description: 'The observed pattern is likely due to stellar variability, instrumental noise, or an eclipsing binary star system, not an exoplanet.',
  },
};

export const MOCK_ARCHIVE_DATA: YearlyArchiveData[] = [
    { year: 2025, totalClassifications: 13500, confirmedExoplanets: 180, planetaryCandidates: 390, falsePositives: 12930 },
    { year: 2024, totalClassifications: 13100, confirmedExoplanets: 165, planetaryCandidates: 360, falsePositives: 12575 },
    { year: 2023, totalClassifications: 12450, confirmedExoplanets: 152, planetaryCandidates: 340, falsePositives: 11958 },
    { year: 2022, totalClassifications: 11890, confirmedExoplanets: 135, planetaryCandidates: 310, falsePositives: 11445 },
    { year: 2021, totalClassifications: 10500, confirmedExoplanets: 110, planetaryCandidates: 280, falsePositives: 10110 },
    { year: 2020, totalClassifications: 9850, confirmedExoplanets: 95, planetaryCandidates: 250, falsePositives: 9505 },
    { year: 2019, totalClassifications: 8700, confirmedExoplanets: 88, planetaryCandidates: 220, falsePositives: 8392 },
];

export const RECENT_NASA_EXOPLANETS: NasaExoplanet[] = [
  {
    name: 'Kepler-186f (Simulated)',
    discoveryYear: 2024,
    orbitalPeriod: 129.9,
    transitDuration: 5.2,
    planetaryRadius: 1.17,
    stellarTemperature: 3788,
  },
  {
    name: 'TOI 700 d (Simulated)',
    discoveryYear: 2024,
    orbitalPeriod: 37.4,
    transitDuration: 2.1,
    planetaryRadius: 1.19,
    stellarTemperature: 3480,
  },
  {
    name: 'Proxima Centauri b (Simulated)',
    discoveryYear: 2025,
    orbitalPeriod: 11.2,
    transitDuration: 0.9,
    planetaryRadius: 1.07,
    stellarTemperature: 3042,
  },
  {
    name: 'LP 890-9 c (Simulated)',
    discoveryYear: 2025,
    orbitalPeriod: 8.46,
    transitDuration: 1.5,
    planetaryRadius: 1.37,
    stellarTemperature: 2850,
  }
];