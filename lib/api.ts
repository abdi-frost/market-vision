import { CandlestickData } from './types';

// Using Alpha Vantage free API - users can get a free API key at https://www.alphavantage.co/support/#api-key
const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

export async function fetchDailyData(symbol: string): Promise<CandlestickData[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}&outputsize=compact`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch daily data');
    }
    
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    if (data['Note']) {
      // API rate limit reached
      console.warn('API rate limit reached, using mock data');
      return generateMockData(100);
    }
    
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      console.warn('No time series data available, using mock data');
      return generateMockData(100);
    }
    
    const candles: CandlestickData[] = Object.entries(timeSeries)
      .map(([date, values]) => {
        const v = values as Record<string, string>;
        return {
          time: date,
          open: parseFloat(v['1. open']),
          high: parseFloat(v['2. high']),
          low: parseFloat(v['3. low']),
          close: parseFloat(v['4. close']),
          volume: parseFloat(v['5. volume'])
        };
      })
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    return candles;
  } catch (error) {
    console.error('Error fetching daily data:', error);
    // Return mock data as fallback
    return generateMockData(100);
  }
}

export async function fetchIntradayData(symbol: string, interval: string = '60min'): Promise<CandlestickData[]> {
  try {
    const response = await fetch(
      `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${API_KEY}&outputsize=full`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch intraday data');
    }
    
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    if (data['Note']) {
      // API rate limit reached
      console.warn('API rate limit reached, using mock data');
      return generateMockData(240); // 4-hour intervals for 40 days
    }
    
    const timeSeries = data[`Time Series (${interval})`];
    if (!timeSeries) {
      console.warn('No time series data available, using mock data');
      return generateMockData(240);
    }
    
    const candles: CandlestickData[] = Object.entries(timeSeries)
      .map(([datetime, values]) => {
        const v = values as Record<string, string>;
        return {
          time: datetime,
          open: parseFloat(v['1. open']),
          high: parseFloat(v['2. high']),
          low: parseFloat(v['3. low']),
          close: parseFloat(v['4. close']),
          volume: parseFloat(v['5. volume'])
        };
      })
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    return candles;
  } catch (error) {
    console.error('Error fetching intraday data:', error);
    // Return mock data as fallback
    return generateMockData(240);
  }
}

// Generate realistic mock data for demonstration
function generateMockData(count: number): CandlestickData[] {
  const data: CandlestickData[] = [];
  let basePrice = 100 + Math.random() * 100;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - count);
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Add some trend and volatility
    const trend = Math.sin(i / 10) * 5;
    const volatility = (Math.random() - 0.5) * 10;
    basePrice = basePrice + trend + volatility;
    
    const open = basePrice;
    const change = (Math.random() - 0.5) * 8;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;
    
    data.push({
      time: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(1000000 + Math.random() * 5000000)
    });
  }
  
  return data;
}

// Convert intraday data to 4-hour timeframe
export function convertTo4Hour(intradayData: CandlestickData[]): CandlestickData[] {
  const fourHourData: CandlestickData[] = [];
  
  // Group by 4-hour periods
  for (let i = 0; i < intradayData.length; i += 4) {
    const period = intradayData.slice(i, i + 4);
    if (period.length === 0) continue;
    
    const fourHourCandle: CandlestickData = {
      time: period[0].time,
      open: period[0].open,
      high: Math.max(...period.map(c => c.high)),
      low: Math.min(...period.map(c => c.low)),
      close: period[period.length - 1].close,
      volume: period.reduce((sum, c) => sum + (c.volume || 0), 0)
    };
    
    fourHourData.push(fourHourCandle);
  }
  
  return fourHourData;
}
