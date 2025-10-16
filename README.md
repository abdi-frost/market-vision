# market-vision

A sophisticated web application that analyzes financial markets using algorithmic logic to predict whether the next trading day will be bullish or bearish.

## Features

- 🔍 **Multi-Timeframe Analysis**: Analyzes both daily and 4-hour candlestick data
- 📊 **Advanced Chart Visualization**: Interactive candlestick charts with technical indicators
- 🤖 **Algorithmic Prediction**: Uses pattern recognition and technical analysis (no ML required)
- 📈 **Pattern Detection**: Identifies key candlestick patterns like:
  - Bullish/Bearish Engulfing
  - Morning/Evening Star
  - Hammer/Shooting Star
  - Doji patterns
- 📉 **Technical Indicators**: 
  - Simple Moving Averages (SMA)
  - Exponential Moving Averages (EMA)
  - Relative Strength Index (RSI)
  - MACD
- 🎨 **Clean UI**: Built with Next.js, TypeScript, and Tailwind CSS
- 🔄 **Real-time Data**: Fetches live market data from Alpha Vantage API

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Custom components with shadcn/ui patterns
- **API**: Alpha Vantage (free tier available)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abdi-frost/market-vision.git
cd market-vision
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up API key for real data:
   - Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Copy `.env.example` to `.env.local`
   - Add your API key:
```bash
cp .env.example .env.local
# Edit .env.local and add your API key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter a stock symbol (e.g., IBM, AAPL, MSFT, GOOGL) in the input field
2. Click "Analyze" to fetch data and generate predictions
3. View the prediction results with confidence scores
4. Explore the candlestick charts for both daily and 4-hour timeframes
5. Review detected patterns and technical analysis reasoning

## How It Works

### Algorithmic Analysis

The application uses a multi-layered approach to predict market direction:

1. **Pattern Recognition**:
   - Scans recent candlesticks for well-known reversal and continuation patterns
   - Each pattern has a weighted score based on historical reliability

2. **Trend Analysis**:
   - Calculates moving averages (SMA20, SMA50, EMA12, EMA26)
   - Analyzes price position relative to key moving averages
   - Determines trend strength and direction

3. **Momentum Indicators**:
   - RSI to identify overbought/oversold conditions
   - MACD for trend confirmation
   - Recent price action momentum

4. **Multi-Timeframe Confirmation**:
   - Analyzes both daily and 4-hour timeframes
   - Higher confidence when timeframes align
   - Accounts for divergences between timeframes

5. **Confidence Scoring**:
   - Combines all signals with weighted scores
   - Provides confidence percentage for the prediction
   - Includes detailed reasoning for transparency

### Mock Data

When API limits are reached or no API key is provided, the application generates realistic mock data for demonstration purposes. This allows you to test the features without external dependencies.

## Project Structure

```
market-vision/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main application page
├── components/
│   ├── button.tsx        # Button component
│   ├── card.tsx          # Card components
│   ├── candlestick-chart.tsx  # Chart visualization
│   ├── market-data-display.tsx  # Market data stats
│   └── prediction-card.tsx     # Prediction results display
├── lib/
│   ├── analysis.ts       # Algorithmic analysis logic
│   ├── api.ts            # API integration and mock data
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## API Integration

The app uses Alpha Vantage API for market data:
- Free tier: 25 API calls per day
- Supports multiple stock symbols
- Includes both daily and intraday data

## Disclaimer

⚠️ **This application is for educational and demonstration purposes only.**

The predictions provided by this tool are based on algorithmic analysis of historical data and technical indicators. They should **NOT** be considered as financial advice. 

Always:
- Conduct your own research
- Consult with qualified financial professionals
- Understand the risks of trading and investing
- Never invest money you cannot afford to lose

Past performance does not guarantee future results.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Market data provided by [Alpha Vantage](https://www.alphavantage.co/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/)

