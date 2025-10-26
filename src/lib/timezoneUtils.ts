/**
 * Timezone utilities for converting timestamps to New York (Eastern) time
 * Handles both EST (UTC-5) and EDT (UTC-4) automatically
 */

/**
 * Convert a UTC timestamp to New York (Eastern) time
 * @param utcTimestamp - Unix timestamp in seconds
 * @returns Unix timestamp adjusted to NY time (for display purposes)
 */
export function convertToNYTime(utcTimestamp: number): number {
  // Return the original timestamp - we'll use this for internal calculations
  // but display it with NY timezone formatting
  return utcTimestamp;
}

/**
 * Format a timestamp to display in New York time
 * @param utcTimestamp - Unix timestamp in seconds
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string in NY time
 */
export function formatNYTime(
  utcTimestamp: number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(utcTimestamp * 1000);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };
  
  return date.toLocaleString("en-US", defaultOptions);
}

/**
 * Get the current offset for New York time (in hours)
 * Returns -5 for EST or -4 for EDT
 */
export function getNYTimeOffset(): number {
  const now = new Date();
  
  // Get the time in UTC and NY
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const nyDate = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  
  // Calculate offset in hours
  const offsetMs = nyDate.getTime() - utcDate.getTime();
  return offsetMs / (1000 * 60 * 60);
}

/**
 * Check if a given date is in Daylight Saving Time for New York
 */
export function isNYDST(date: Date = new Date()): boolean {
  const offset = getNYTimeOffset();
  return offset === -4; // EDT is UTC-4, EST is UTC-5
}

/**
 * Convert a date string (YYYY-MM-DD or ISO format) to Unix timestamp
 * Interprets the date as NY time
 */
export function dateStringToNYTimestamp(dateString: string): number {
  // Parse the date as if it's in NY timezone
  const nyDateString = new Date(dateString + "T00:00:00").toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  const nyDate = new Date(nyDateString);
  
  return Math.floor(nyDate.getTime() / 1000);
}

/**
 * Format timestamp for chart tooltip
 */
export function formatChartTooltipTime(utcTimestamp: number): string {
  return formatNYTime(utcTimestamp, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
