# Timezone Handling Notes

## Current Implementation

The Market Vision application uses **UTC timestamps** for all financial data, which is the standard in financial markets. This ensures consistency across different user locations and time zones.

### TradingView Lightweight Charts

The TradingView Lightweight Charts library (v4.2.1) used in this application:
- Uses UTC timestamps internally
- Does NOT have built-in timezone conversion features
- Displays times based on the browser's locale by default

### Timezone Utilities

We've created timezone utilities (`src/lib/timezoneUtils.ts`) that provide:
- Conversion helpers for New York (Eastern) time
- Automatic Daylight Saving Time (DST) handling
- Time formatting functions for tooltips and labels

### Why UTC?

1. **Standard Practice**: Financial markets operate on UTC timestamps
2. **Consistency**: Data from APIs (like Twelve Data) comes in UTC
3. **Compatibility**: Lightweight Charts requires UTC timestamps
4. **User Control**: Users can view times in their local timezone via browser settings

### Future Enhancements

To fully support New York timezone display on the chart axis labels, the following options are available:

1. **Upgrade to a newer version** of lightweight-charts that may support timezone configuration (check latest releases)
2. **Custom Time Formatter**: Implement a custom time scale formatter (requires modifying chart options)
3. **Pre-process timestamps**: Convert timestamps before passing to the chart (may cause issues with real-time updates)
4. **Use a different charting library**: Consider alternatives that have built-in timezone support

### Recommended Approach

For most users, the current UTC implementation works well because:
- Trading platforms typically use UTC or exchange local time
- Browser locale automatically adjusts display
- Users can configure their browser to display times in their preferred timezone

If NY-specific time display is critical, we recommend:
1. Adding a timezone selector UI component
2. Using the timezone utilities to format custom tooltips and labels
3. Adding a note on the chart indicating "Times displayed in UTC" or user-selected timezone
