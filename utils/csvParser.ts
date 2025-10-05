import type { ExoplanetData } from '../types';

// The numeric headers that are strictly required.
const REQUIRED_NUMERIC_HEADERS: (keyof ExoplanetData)[] = [
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
  const isHeaderPresent = firstLineRawItems.some(item => item !== '' && isNaN(parseFloat(item)));

  let dataLines: string[];
  let columnMapping: { [key in keyof ExoplanetData]?: number };

  if (isHeaderPresent) {
    const header = firstLineRawItems;
    dataLines = maxRows ? lines.slice(1, maxRows + 1) : lines.slice(1);

    const missingHeaders = REQUIRED_NUMERIC_HEADERS.filter(h => !header.includes(h));
    if (missingHeaders.length > 0) {
        throw new Error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    // Create a mapping from our required fields to their index in the CSV header
    columnMapping = {
        name: header.indexOf('name'), // Will be -1 if not found
        orbitalPeriod: header.indexOf('orbitalPeriod'),
        transitDuration: header.indexOf('transitDuration'),
        planetaryRadius: header.indexOf('planetaryRadius'),
        stellarTemperature: header.indexOf('stellarTemperature'),
    };
    
  } else {
    // No header detected, assume fixed order for numeric values
    dataLines = maxRows ? lines.slice(0, maxRows) : lines;
    
    const firstLineDataItems = firstLineRawItems.filter(item => item !== '');
    if (firstLineDataItems.length !== REQUIRED_NUMERIC_HEADERS.length) {
        throw new Error(`CSV without a header must have exactly ${REQUIRED_NUMERIC_HEADERS.length} columns (found ${firstLineDataItems.length}). Expected order: ${REQUIRED_NUMERIC_HEADERS.join(', ')}`);
    }

    columnMapping = {
        name: -1, // No name column assumed for header-less files
        orbitalPeriod: 0,
        transitDuration: 1,
        planetaryRadius: 2,
        stellarTemperature: 3,
    };
  }

  const results: ExoplanetData[] = [];

  for (const line of dataLines) {
    const dataRow = line.split(',');

    const nameIndex = columnMapping.name ?? -1;
    const orbitalPeriodIndex = columnMapping.orbitalPeriod!;
    const transitDurationIndex = columnMapping.transitDuration!;
    const planetaryRadiusIndex = columnMapping.planetaryRadius!;
    const stellarTemperatureIndex = columnMapping.stellarTemperature!;
    
    // Skip malformed/empty lines
    const maxIndex = Math.max(orbitalPeriodIndex, transitDurationIndex, planetaryRadiusIndex, stellarTemperatureIndex);
    if (dataRow.length <= maxIndex) continue;

    const parsedData = {
        name: nameIndex !== -1 && dataRow[nameIndex] ? dataRow[nameIndex].trim() : `CSV Candidate #${results.length + 1}`,
        orbitalPeriod: parseFloat(dataRow[orbitalPeriodIndex]),
        transitDuration: parseFloat(dataRow[transitDurationIndex]),
        planetaryRadius: parseFloat(dataRow[planetaryRadiusIndex]),
        stellarTemperature: parseFloat(dataRow[stellarTemperatureIndex]),
    };

    const invalidEntries = Object.entries(parsedData).filter(([key, value]) => {
        return key !== 'name' && (typeof value !== 'number' || isNaN(value));
    });

    if (invalidEntries.length > 0) {
        const invalidKeys = invalidEntries.map(([key]) => key).join(', ');
        console.warn(`Skipping row with invalid non-numeric data for: ${invalidKeys} in row: "${line}"`);
        continue;
    }

    results.push(parsedData as ExoplanetData);
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