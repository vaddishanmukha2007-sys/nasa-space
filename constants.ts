import { ExoplanetData, ClassificationResult, ModelMetrics, Hyperparameters, KnownExoplanet, YearlyArchiveData } from './types';

export const DEFAULT_EXOPLANET_DATA: ExoplanetData = {
  orbitalPeriod: 365.25,
  transitDuration: 8.5,
  planetaryRadius: 1.0,
  stellarTemperature: 5778,
};

export const DEFAULT_HYPERPARAMETERS: Hyperparameters = {
  learningRate: 0.01,
  maxDepth: 5,
  nEstimators: 100,
};

export const MOCK_MODEL_METRICS: ModelMetrics = {
  accuracy: 0.96,
  precision: 0.95,
  recall: 0.97,
  f1Score: 0.96,
};

export const MOCK_CONFUSION_MATRIX = {
  labels: ["Confirmed", "Candidate", "False Positive"],
  values: [
    [1024, 25, 10],
    [30, 850, 45],
    [12, 5, 1250],
  ],
};

// Calculated using a one-vs-rest approach for the "Confirmed" class.
// TP = values[0][0]
// FN = sum of row[0] - TP
// FP = sum of col[0] - TP
// TN = sum of all cells - (TP + FN + FP)
export const MOCK_DETAILED_METRICS = {
    truePositives: 1024,
    falseNegatives: 25 + 10, // 35
    falsePositives: 30 + 12, // 42
    trueNegatives: 850 + 45 + 5 + 1250, // 2150
};


export const CLASSIFICATION_DETAILS = {
  [ClassificationResult.CONFIRMED_EXOPLANET]: {
    label: "Confirmed Exoplanet",
    color: "text-green-400 border-green-400 bg-green-900/50",
    description: "The model predicts with high confidence that the signal corresponds to a genuine exoplanet.",
  },
  [ClassificationResult.PLANETARY_CANDIDATE]: {
    label: "Planetary Candidate",
    color: "text-yellow-400 border-yellow-400 bg-yellow-900/50",
    description: "The signal shows characteristics of an exoplanet but requires further observation and analysis for confirmation.",
  },
  [ClassificationResult.FALSE_POSITIVE]: {
    label: "False Positive",
    color: "text-red-400 border-red-400 bg-red-900/50",
    description: "The model predicts the signal is likely caused by stellar activity, instrumental noise, or an eclipsing binary star system.",
  },
  [ClassificationResult.NONE]: {
    label: "Awaiting Analysis",
    color: "text-slate-400 border-slate-400 bg-slate-900/50",
    description: "Submit data for classification.",
  },
};

export const KNOWN_EXOPLANETS: KnownExoplanet[] = [
  {
    name: "Kepler-186f",
    data: {
      orbitalPeriod: 129.9,
      transitDuration: 5.4,
      planetaryRadius: 1.17,
      stellarTemperature: 3755,
    },
    fact: "The first Earth-sized planet discovered in the habitable zone of another star, often called Earth's 'cousin'."
  },
  {
    name: "TRAPPIST-1e",
    data: {
      orbitalPeriod: 6.1,
      transitDuration: 1.2,
      planetaryRadius: 0.92,
      stellarTemperature: 2566,
    },
    fact: "Considered one of the most promising potentially habitable exoplanets due to its size, temperature, and the amount of radiation it receives."
  },
  {
    name: "51 Pegasi b",
    data: {
      orbitalPeriod: 4.2,
      transitDuration: 2.9,
      planetaryRadius: 19.0, // Jupiter is ~11 Earth radii, this is a "hot Jupiter"
      stellarTemperature: 5793,
    },
    fact: "Nicknamed 'Dimidium', it was the first exoplanet discovered orbiting a main-sequence star like our Sun."
  },
  {
    name: "Proxima Centauri b",
    data: {
      orbitalPeriod: 11.2,
      transitDuration: 0.8, // Note: Transit is unconfirmed, this is simulated for the app
      planetaryRadius: 1.1,
      stellarTemperature: 3042,
    },
    fact: "The closest known exoplanet to Earth, orbiting our nearest stellar neighbor, Proxima Centauri."
  }
];

export const MOCK_ARCHIVE_DATA: YearlyArchiveData[] = [
  {
    year: 2025,
    totalClassifications: 15500,
    confirmedExoplanets: 380,
    planetaryCandidates: 1100,
    falsePositives: 14020,
  },
  {
    year: 2024,
    totalClassifications: 14000,
    confirmedExoplanets: 350,
    planetaryCandidates: 1000,
    falsePositives: 12650,
  },
  {
    year: 2023,
    totalClassifications: 12543,
    confirmedExoplanets: 312,
    planetaryCandidates: 890,
    falsePositives: 11341,
  },
  {
    year: 2022,
    totalClassifications: 10876,
    confirmedExoplanets: 288,
    planetaryCandidates: 754,
    falsePositives: 9834,
  },
  {
    year: 2021,
    totalClassifications: 9531,
    confirmedExoplanets: 251,
    planetaryCandidates: 699,
    falsePositives: 8581,
  },
];