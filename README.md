# Market Vision

**Bullish or Bearish Day Prediction**

A Next.js TypeScript web application that analyzes financial market data (candlestick OHLC data) and algorithmically predicts whether the next day is likely to be **bullish** or **bearish**.

## 🎯 Features

- 📈 Real-time market data visualization with interactive charts
- 🤖 Algorithmic prediction engine for market trends
- 💎 Beautiful UI built with shadcn/ui and Tailwind CSS
- 📊 Detailed OHLC (Open, High, Low, Close) data analysis
- 🎨 Responsive design with dark mode support

## ⚙️ Tech Stack

- **Framework:** Next.js 15 with TypeScript
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Linting:** ESLint + Prettier

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── analyze/        # Analysis page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Chart.tsx       # Chart component
│   ├── Navbar.tsx      # Navigation bar
│   └── Footer.tsx      # Footer component
├── lib/                # Utilities and helpers
│   └── utils.ts        # Utility functions
├── services/           # API services
│   └── marketData.ts   # Market data fetching
└── algorithms/         # Prediction algorithms
    └── predictNextDay.ts # Market prediction logic
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🎨 Pages

### Home (`/`)
- Market summary with latest OHLC data
- Next day prediction (Bullish/Bearish)
- Confidence score
- Last 7 days chart preview

### Analyze (`/analyze`)
- Full OHLC data visualization
- Detailed data table
- Symbol search functionality
- Manual prediction trigger
- Comprehensive algorithmic analysis

## 🔌 API Routes

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

- [ ] Integrate live API data (Twelve Data, Alpha Vantage, Finnhub)
- [ ] Add configurable timeframes (1D, 4H, 1H)
- [ ] Implement advanced technical indicators (RSI, MACD, Moving Averages)
- [ ] Add candlestick pattern recognition
- [ ] Include local storage or database for historical data
- [ ] Implement user authentication for personalized settings
- [ ] Add more sophisticated machine learning models

## 📄 License

This project is for educational purposes only. Use at your own risk.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
