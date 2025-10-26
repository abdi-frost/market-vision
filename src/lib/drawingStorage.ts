/**
 * Local Storage utilities for persisting chart drawings
 */

export interface DrawingPoint {
  time: number; // UTC timestamp
  price: number;
}

export type DrawingType = "line" | "rectangle" | "trendline";

export interface Drawing {
  id: string;
  type: DrawingType;
  points: DrawingPoint[];
  color?: string;
  lineWidth?: number;
  createdAt: number;
}

interface DrawingStorage {
  [symbolAndInterval: string]: Drawing[];
}

const STORAGE_KEY = "market-vision-drawings";

/**
 * Generate a storage key for a specific symbol and interval
 */
function getStorageKey(symbol: string, interval: string): string {
  return `${symbol}_${interval}`;
}

/**
 * Load all drawings from localStorage
 */
function loadAllDrawings(): DrawingStorage {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error loading drawings from localStorage:", error);
    return {};
  }
}

/**
 * Save all drawings to localStorage
 */
function saveAllDrawings(storage: DrawingStorage): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Error saving drawings to localStorage:", error);
  }
}

/**
 * Load drawings for a specific symbol and interval
 */
export function loadDrawings(symbol: string, interval: string): Drawing[] {
  const storage = loadAllDrawings();
  const key = getStorageKey(symbol, interval);
  return storage[key] || [];
}

/**
 * Save drawings for a specific symbol and interval
 */
export function saveDrawings(
  symbol: string,
  interval: string,
  drawings: Drawing[]
): void {
  const storage = loadAllDrawings();
  const key = getStorageKey(symbol, interval);
  storage[key] = drawings;
  saveAllDrawings(storage);
}

/**
 * Add a new drawing
 */
export function addDrawing(
  symbol: string,
  interval: string,
  drawing: Drawing
): void {
  const drawings = loadDrawings(symbol, interval);
  drawings.push(drawing);
  saveDrawings(symbol, interval, drawings);
}

/**
 * Remove a drawing by ID
 */
export function removeDrawing(
  symbol: string,
  interval: string,
  drawingId: string
): void {
  const drawings = loadDrawings(symbol, interval);
  const filtered = drawings.filter((d) => d.id !== drawingId);
  saveDrawings(symbol, interval, filtered);
}

/**
 * Clear all drawings for a specific symbol and interval
 */
export function clearDrawings(symbol: string, interval: string): void {
  saveDrawings(symbol, interval, []);
}

/**
 * Clear all drawings across all symbols and intervals
 */
export function clearAllDrawings(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing all drawings:", error);
  }
}

/**
 * Generate a unique ID for a drawing
 */
export function generateDrawingId(): string {
  return `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
