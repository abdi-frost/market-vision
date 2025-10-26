"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  TrendingUp,
  Minus,
  Square,
  Move,
} from "lucide-react";

export interface ForexCandle {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface AdvancedChartProps {
  data: ForexCandle[];
  title?: string;
  symbol?: string;
  interval?: string;
  onIntervalChange?: (interval: string) => void;
}

type DrawingTool = "none" | "line" | "rectangle" | "trendline";

// Detect if device is mobile
const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Calculate optimal data points based on device
const getOptimalDataPoints = (totalDataPoints: number): number => {
  if (typeof window === "undefined") return totalDataPoints;
  
  const isMobile = isMobileDevice();
  const width = window.innerWidth;
  
  // Mobile devices: show fewer data points for better performance
  if (isMobile || width < 768) {
    return Math.min(60, totalDataPoints); // Max 60 candles on mobile
  } else if (width < 1024) {
    return Math.min(90, totalDataPoints); // Max 90 candles on tablet
  }
  
  return totalDataPoints; // Full data on desktop
};

export function AdvancedChart({
  data,
  title = "OHLC Data",
  symbol,
  interval = "1day",
  onIntervalChange,
}: AdvancedChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>("none");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleDataPoints, setVisibleDataPoints] = useState(0);
  const [showLoadMore, setShowLoadMore] = useState(false);

  const chartTitle = symbol ? `${symbol} - ${title}` : title;

  // Calculate visible data points based on device
  useEffect(() => {
    const updateVisiblePoints = () => {
      const optimalPoints = getOptimalDataPoints(data.length);
      setVisibleDataPoints(optimalPoints);
      setShowLoadMore(optimalPoints < data.length);
    };
    
    updateVisiblePoints();
    window.addEventListener('resize', updateVisiblePoints);
    
    return () => window.removeEventListener('resize', updateVisiblePoints);
  }, [data.length]);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDarkMode ? "#0f172a" : "#ffffff" },
        textColor: isDarkMode ? "#e2e8f0" : "#1e293b",
      },
      grid: {
        vertLines: { color: isDarkMode ? "#334155" : "#e2e8f0" },
        horzLines: { color: isDarkMode ? "#334155" : "#e2e8f0" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: isDarkMode ? "#334155" : "#cbd5e1",
      },
      timeScale: {
        borderColor: isDarkMode ? "#334155" : "#cbd5e1",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [isDarkMode]);

  // Update data
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    // Use only visible data points for better performance
    const dataToDisplay = visibleDataPoints > 0 && visibleDataPoints < data.length
      ? data.slice(-visibleDataPoints)
      : data;

    const candlestickData: CandlestickData[] = dataToDisplay.map((candle) => ({
      time: (new Date(candle.datetime).getTime() / 1000) as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(candlestickData);
    
    // Auto-fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data, visibleDataPoints]);

  // Zoom controls
  const handleZoomIn = () => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const range = timeScale.getVisibleLogicalRange();
    if (range) {
      const delta = (range.to - range.from) * 0.2;
      timeScale.setVisibleLogicalRange({
        from: range.from + delta,
        to: range.to - delta,
      });
    }
  };

  const handleZoomOut = () => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    const range = timeScale.getVisibleLogicalRange();
    if (range) {
      const delta = (range.to - range.from) * 0.2;
      timeScale.setVisibleLogicalRange({
        from: range.from - delta,
        to: range.to + delta,
      });
    }
  };

  const handleResetZoom = () => {
    if (!chartRef.current) return;
    chartRef.current.timeScale().fitContent();
  };

  const handleToolSelect = (tool: DrawingTool) => {
    setActiveTool(tool);
    // In a full implementation, this would enable drawing functionality
    // For now, we'll just show the active state
  };

  const handleLoadMore = () => {
    // Load all data
    setVisibleDataPoints(data.length);
    setShowLoadMore(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg md:text-xl">{chartTitle}</CardTitle>
            {onIntervalChange && (
              <div className="flex gap-2">
                <Button
                  variant={interval === "4h" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onIntervalChange("4h")}
                >
                  4H
                </Button>
                <Button
                  variant={interval === "1day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onIntervalChange("1day")}
                >
                  Daily
                </Button>
              </div>
            )}
          </div>

          {/* Performance info for mobile */}
          {showLoadMore && (
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-xs md:text-sm">
              <span className="text-blue-700 dark:text-blue-300">
                Showing last {visibleDataPoints} of {data.length} candles for better performance
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                className="text-blue-700 dark:text-blue-300 h-auto py-1 px-2"
              >
                Load All
              </Button>
            </div>
          )}

          {/* Chart Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Zoom Controls */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                title="Zoom In"
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Drawing Tools */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={activeTool === "none" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleToolSelect("none")}
                title="Select"
                className="h-8 w-8 p-0"
              >
                <Move className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === "line" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleToolSelect("line")}
                title="Draw Line"
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === "rectangle" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleToolSelect("rectangle")}
                title="Draw Rectangle"
                className="h-8 w-8 p-0"
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant={activeTool === "trendline" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleToolSelect("trendline")}
                title="Draw Trend Line"
                className="h-8 w-8 p-0"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={chartContainerRef}
          style={{ 
            height: isMobileDevice() ? "400px" : "500px", 
            position: "relative",
            touchAction: "pan-y pinch-zoom" // Optimize touch handling for mobile
          }}
        />
        {activeTool !== "none" && (
          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            <p>
              📝 {activeTool === "line" && "Line drawing tool selected"}
              {activeTool === "rectangle" && "Rectangle drawing tool selected"}
              {activeTool === "trendline" && "Trend line drawing tool selected"}
            </p>
            <p className="text-xs mt-1">
              Note: Drawing tools are UI placeholders. Click and drag on the chart to pan, use mouse wheel to zoom.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
