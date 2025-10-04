import type { ExoplanetData } from '../types';

// The expected headers must match the ExoplanetData interface keys.
const REQUIRED_HEADERS: (keyof ExoplanetData)[] = [
  'orbitalPeriod',
  'transitDuration',
  'planetaryRadius',
  'stellarTemperature',
];


/**
 * Core parsing logic that can handle multiple rows.
 */
const parseCsvRows = (csvContent: string, maxRows?: number): ExoplanetData[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error("CSV must contain a header and at least one data row.");
  }

  const header = lines[0].split(',').map(h => h.trim());
  
  const missingHeaders = REQUIRED_HEADERS.filter(h => !header.includes(h));
  if (missingHeaders.length > 0) {
      throw new Error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
  }

  const dataLines = maxRows ? lines.slice(1, maxRows + 1) : lines.slice(1);
  const results: ExoplanetData[] = [];

  for (const line of dataLines) {
    const dataRow = line.split(',');
    if (dataRow.length < header.length) {
      console.warn("Skipping a data row that has fewer columns than the header.");
      continue;
    }
    
    const dataMap = header.reduce((acc, currentHeader, index) => {
        acc[currentHeader] = dataRow[index]?.trim();
        return acc;
    }, {} as {[key: string]: string});

    const parsedData = {
        orbitalPeriod: parseFloat(dataMap.orbitalPeriod),
        transitDuration: parseFloat(dataMap.transitDuration),
        planetaryRadius: parseFloat(dataMap.planetaryRadius),
        stellarTemperature: parseFloat(dataMap.stellarTemperature),
    };

    const invalidEntries = Object.entries(parsedData).filter(([, value]) => isNaN(value));
    if (invalidEntries.length > 0) {
        const invalidKeys = invalidEntries.map(([key]) => key).join(', ');
        throw new Error(`Invalid non-numeric data found for: ${invalidKeys} in row: ${line}`);
    }

    results.push(parsedData);
  }

  return results;
}

/**
 * Parses the first data row of a CSV file.
 */
export const parseExoplanetCsv = (csvContent: string): ExoplanetData => {
  const data = parseCsvRows(csvContent, 1);
  if (data.length === 0) {
      throw new Error("CSV does not contain any valid data rows.");
  }
  return data[0];
};

/**
 * Parses the first few rows of a CSV file for previewing.
 */
export const previewExoplanetCsv = (csvContent: string, maxRows: number = 5): ExoplanetData[] => {
    return parseCsvRows(csvContent, maxRows);
};