# Market Vision

**Bullish or Bearish Day Prediction**

A Next.js TypeScript web application that analyzes financial market data (candlestick OHLC data) and algorithmically predicts whether the next day is likely to be **bullish** or **bearish**.

## 🎯 Features

- 📈 **Advanced TradingView-powered charts** with professional candlestick visualization
- 🔍 **Interactive charting tools**: Zoom in/out, pan, and drawing tools (lines, rectangles, trend lines)
- 🖱️ **Mouse-driven navigation**: Scroll to zoom, click-drag to pan across time periods
- 🤖 Algorithmic prediction engine for market trends
- 💎 Beautiful UI built with shadcn/ui and Tailwind CSS
- 📊 Detailed OHLC (Open, High, Low, Close) data analysis
- 🎨 Responsive design with dark mode support

## ⚙️ Tech Stack

- **Framework:** Next.js 15 with TypeScript
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS v4
- **Charts:** TradingView Lightweight Charts (professional candlestick charts)
- **Icons:** Lucide React
- **Linting:** ESLint + Prettier

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   │   ├── fetch-data/ # Legacy market data API
│   │   └── forex/      # Twelve Data forex API proxy
│   ├── analyze/        # Analysis page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page (forex landing)
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Chart.tsx       # Legacy chart component
│   ├── AdvancedChart.tsx # TradingView-powered advanced chart
│   ├── ForexChart.tsx  # Forex OHLC chart (uses AdvancedChart)
│   ├── ForexCard.tsx   # Forex pair card
│   ├── PredictionCard.tsx # Prediction display
│   ├── Navbar.tsx      # Navigation bar
│   └── Footer.tsx      # Footer component
├── lib/                # Utilities and helpers
│   └── utils.ts        # Utility functions
├── services/           # API services
│   ├── marketData.ts   # Legacy market data
│   └── twelveData.ts   # Twelve Data API integration
└── algorithms/         # Prediction algorithms
    └── predictNextDay.ts # Market prediction logic
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- (Optional) Twelve Data API key for live forex data

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

3. Set up environment variables (optional for live data):
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Twelve Data API key:
```
TWELVE_API_KEY=your_api_key_here
```

Get a free API key from [Twelve Data](https://twelvedata.com).

**Note:** The app works with mock data by default, so you can skip this step for development.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🎨 Pages

### Home (`/`)
- **Forex pair selection**: Choose from 7 major forex pairs (EUR/USD, GBP/USD, etc.)
- **Advanced TradingView charts**: Professional candlestick charts with zoom and navigation
- **Interactive controls**: Zoom in/out, pan with mouse, drawing tools UI
- **Timeframe switcher**: Toggle between 4H and Daily intervals
- **Next day prediction**: Bullish/Bearish trend prediction with confidence score
- **OHLC summary**: Current Open, High, Low, Close values
- **Interactive cards**: Click any forex pair to update the chart and analysis

### Analyze (`/analyze`)
- Full OHLC data visualization
- Detailed data table
- Symbol search functionality
- Manual prediction trigger
- Comprehensive algorithmic analysis

## 🔌 API Routes

### `/api/forex`
Fetches forex OHLC data from Twelve Data API (or mock data for development).

**Query Parameters:**
- `symbol` (optional): Forex pair symbol (default: "EUR/USD")
- `interval` (optional): Time interval (default: "1day")

**Response:**
```json
{
  "success": true,
  "symbol": "EUR/USD",
  "interval": "1day",
  "data": [
    {
      "datetime": "2024-10-16",
      "open": 1.0950,
      "high": 1.0975,
      "low": 1.0920,
      "close": 1.0965
    }
  ],
  "usingMockData": false
}
```

### `/api/fetch-data`
Fetches OHLC market data for a given symbol.

**Query Parameters:**
- `symbol` (optional): Stock symbol (default: "AAPL")

**Response:**
```json
{
  "success": true,
  "symbol": "AAPL",
  "data": [
    {
      "date": "2024-01-01",
      "open": 100,
      "high": 110,
      "low": 95,
      "close": 105
    }
  ]
}
```

## 🧠 Prediction Algorithm

The current implementation uses a simple rule-based algorithm:
- **Bullish**: If close price > open price
- **Bearish**: If close price ≤ open price

Confidence is calculated based on price movement within the day's range.

## 🔮 Future Enhancements

- [x] Integrate live API data (Twelve Data)
- [x] Advanced charting with TradingView-like features (zoom, pan, drawing tools UI)
- [ ] Implement full drawing tool functionality (trend lines, shapes, annotations)
- [ ] Add configurable timeframes (1D, 4H, 1H) switcher UI
- [ ] Replace mock predictions with advanced algorithmic models
- [ ] Implement advanced technical indicators (RSI, MACD, Moving Averages)
- [ ] Add candlestick pattern recognition
- [ ] Include data caching to reduce API calls
- [ ] Implement user authentication for personalized settings
- [ ] Add more sophisticated machine learning models

## 📊 Chart Features

The application now uses **TradingView's Lightweight Charts** library for professional-grade financial charting:

### Interactive Controls
- **Zoom In/Out**: Use the zoom buttons or mouse wheel to zoom
- **Pan**: Click and drag to move across the timeline
- **Reset**: Instantly fit all data in view
- **Crosshair**: Hover over candles to see detailed OHLC data

### Drawing Tools (UI Ready)
The toolbar includes placeholders for drawing tools:
- **Line Tool**: For trend analysis
- **Rectangle Tool**: For highlighting zones
- **Trend Line Tool**: For advanced technical analysis

*Note: Drawing tools are UI placeholders. Full functionality can be implemented using the lightweight-charts plugin system.*

### Responsive Design
- Automatically adapts to screen size
- Touch-friendly controls for mobile devices
- Dark mode support with smooth theme transitions

## 📄 License

This project is for educational purposes only. Use at your own risk.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
