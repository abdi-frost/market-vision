'use client';

import { PredictionResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface PredictionCardProps {
  prediction: PredictionResult;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const getIcon = () => {
    switch (prediction.prediction) {
      case 'bullish':
        return <TrendingUp className="h-8 w-8 text-green-600" />;
      case 'bearish':
        return <TrendingDown className="h-8 w-8 text-red-600" />;
      default:
        return <Minus className="h-8 w-8 text-gray-600" />;
    }
  };

  const getColorClass = () => {
    switch (prediction.prediction) {
      case 'bullish':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = () => {
    if (prediction.confidence > 70) return 'text-green-600';
    if (prediction.confidence > 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Market Prediction</CardTitle>
            <CardDescription>Algorithmic analysis for next trading day</CardDescription>
          </div>
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Prediction */}
        <div className={`p-4 rounded-lg border-2 ${getColorClass()}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase">Prediction</p>
              <p className="text-3xl font-bold capitalize mt-1">{prediction.prediction}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Confidence</p>
              <p className={`text-3xl font-bold mt-1 ${getConfidenceColor()}`}>
                {prediction.confidence.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Analysis */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Timeframe Analysis
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(prediction.timeframeAnalysis).map(([timeframe, analysis]) => (
              <div
                key={timeframe}
                className="p-3 border rounded bg-gray-50"
              >
                <p className="text-xs font-medium text-gray-600 uppercase">{timeframe}</p>
                <p className={`font-semibold capitalize ${
                  analysis.trend === 'bullish' ? 'text-green-600' :
                  analysis.trend === 'bearish' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {analysis.trend}
                </p>
                <p className="text-xs text-gray-500">
                  Strength: {(analysis.strength * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Patterns Detected */}
        {prediction.patterns.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Detected Patterns</h4>
            <div className="space-y-2">
              {prediction.patterns.map((pattern, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border text-sm ${
                    pattern.score > 0 ? 'bg-green-50 border-green-200' :
                    pattern.score < 0 ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{pattern.pattern}</span>
                    <span className={`text-xs ${
                      pattern.score > 0 ? 'text-green-600' :
                      pattern.score < 0 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {pattern.score > 0 ? '↑' : pattern.score < 0 ? '↓' : '−'} 
                      {Math.abs(pattern.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{pattern.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning */}
        <div>
          <h4 className="font-semibold mb-2">Analysis Reasoning</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            {prediction.reasoning.map((reason, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
