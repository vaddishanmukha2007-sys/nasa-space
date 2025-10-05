import type { ExoplanetData } from '../types';

// The expected headers/column order must match the ExoplanetData interface keys.
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
  const lines = csvContent.trim().split('\n').filter(line => line.trim() !== '');
  if (lines.length < 1) {
    throw new Error("CSV file is empty or contains no data.");
  }

  const firstLineRawItems = lines[0].split(',').map(item => item.trim());
  
  // A row is a header if it contains at least one non-empty value that is not a number.
  // This avoids treating rows with trailing commas (which produce empty strings) as headers.
  const isHeaderPresent = firstLineRawItems.some(item => item !== '' && isNaN(parseFloat(item)));

  let dataLines: string[];
  let columnMapping: { [key in keyof ExoplanetData]: number };

  if (isHeaderPresent) {
    const header = firstLineRawItems;
    dataLines = maxRows ? lines.slice(1, maxRows + 1) : lines.slice(1);

    const missingHeaders = REQUIRED_HEADERS.filter(h => !header.includes(h));
    if (missingHeaders.length > 0) {
        throw new Error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    // Create a mapping from our required fields to their index in the CSV header
    columnMapping = {
        orbitalPeriod: header.indexOf('orbitalPeriod'),
        transitDuration: header.indexOf('transitDuration'),
        planetaryRadius: header.indexOf('planetaryRadius'),
        stellarTemperature: header.indexOf('stellarTemperature'),
    };
    
  } else {
    // No header detected, assume fixed order
    dataLines = maxRows ? lines.slice(0, maxRows) : lines;
    
    // Check number of columns, ignoring empty values from trailing commas
    const firstLineDataItems = firstLineRawItems.filter(item => item !== '');
    if (firstLineDataItems.length !== REQUIRED_HEADERS.length) {
        throw new Error(`CSV without a header must have exactly ${REQUIRED_HEADERS.length} columns (found ${firstLineDataItems.length}). Expected order: ${REQUIRED_HEADERS.join(', ')}`);
    }

    columnMapping = {
        orbitalPeriod: 0,
        transitDuration: 1,
        planetaryRadius: 2,
        stellarTemperature: 3,
    };
  }

  const results: ExoplanetData[] = [];

  for (const line of dataLines) {
    const dataRow = line.split(',');
    
    // Skip malformed/empty lines in the data body
    if (dataRow.length < REQUIRED_HEADERS.length) continue;

    const parsedData = {
        orbitalPeriod: parseFloat(dataRow[columnMapping.orbitalPeriod]),
        transitDuration: parseFloat(dataRow[columnMapping.transitDuration]),
        planetaryRadius: parseFloat(dataRow[columnMapping.planetaryRadius]),
        stellarTemperature: parseFloat(dataRow[columnMapping.stellarTemperature]),
    };

    const invalidEntries = Object.entries(parsedData).filter(([, value]) => isNaN(value));
    if (invalidEntries.length > 0) {
        const invalidKeys = invalidEntries.map(([key]) => key).join(', ');
        // Warn and skip invalid rows instead of throwing an error for the whole file
        console.warn(`Skipping row with invalid non-numeric data for: ${invalidKeys} in row: "${line}"`);
        continue;
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