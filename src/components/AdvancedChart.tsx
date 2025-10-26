"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
  ColorType,
  CrosshairMode,
  MouseEventParams,
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
  Trash2,
} from "lucide-react";
import {
  Drawing,
  DrawingType,
  loadDrawings,
  saveDrawings,
  clearDrawings,
  generateDrawingId,
  DrawingPoint,
} from "@/lib/drawingStorage";

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

export function AdvancedChart({
  data,
  title = "OHLC Data",
  symbol = "CHART",
  interval = "1day",
  onIntervalChange,
}: AdvancedChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>("none");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingPoint[]>([]);

  const chartTitle = symbol ? `${symbol} - ${title}` : title;

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

  // Load saved drawings on mount and when symbol/interval changes
  useEffect(() => {
    const savedDrawings = loadDrawings(symbol, interval);
    setDrawings(savedDrawings);
  }, [symbol, interval]);

  // Convert chart coordinates to time/price
  const coordinateToPrice = useCallback(
    (y: number): number | null => {
      if (!chartRef.current || !seriesRef.current) return null;
      const priceScale = chartRef.current.priceScale("right");
      return priceScale.coordinateToPrice(y);
    },
    []
  );

  const coordinateToTime = useCallback(
    (x: number): number | null => {
      if (!chartRef.current) return null;
      const timeScale = chartRef.current.timeScale();
      const time = timeScale.coordinateToTime(x);
      return time as number | null;
    },
    []
  );

  const priceToCoordinate = useCallback(
    (price: number): number | null => {
      if (!chartRef.current) return null;
      const priceScale = chartRef.current.priceScale("right");
      return priceScale.priceToCoordinate(price);
    },
    []
  );

  const timeToCoordinate = useCallback(
    (time: number): number | null => {
      if (!chartRef.current) return null;
      const timeScale = chartRef.current.timeScale();
      return timeScale.timeToCoordinate(time as UTCTimestamp);
    },
    []
  );

  // Render drawings on canvas
  const renderDrawings = useCallback(() => {
    if (!canvasOverlayRef.current || !chartRef.current) return;

    const canvas = canvasOverlayRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set drawing style
    ctx.strokeStyle = isDarkMode ? "#60a5fa" : "#3b82f6";
    ctx.lineWidth = 2;
    ctx.fillStyle = isDarkMode ? "rgba(96, 165, 250, 0.1)" : "rgba(59, 130, 246, 0.1)";

    // Render saved drawings
    drawings.forEach((drawing) => {
      renderDrawing(ctx, drawing);
    });

    // Render current drawing in progress
    if (isDrawing && currentDrawing.length > 0) {
      const tempDrawing: Drawing = {
        id: "temp",
        type: activeTool as DrawingType,
        points: currentDrawing,
        createdAt: Date.now(),
      };
      renderDrawing(ctx, tempDrawing);
    }
  }, [drawings, isDrawing, currentDrawing, activeTool, isDarkMode]);

  const renderDrawing = useCallback(
    (ctx: CanvasRenderingContext2D, drawing: Drawing) => {
      const points = drawing.points.map((p) => ({
        x: timeToCoordinate(p.time),
        y: priceToCoordinate(p.price),
      }));

      // Filter out null coordinates
      const validPoints = points.filter((p) => p.x !== null && p.y !== null) as {
        x: number;
        y: number;
      }[];

      if (validPoints.length === 0) return;

      ctx.strokeStyle = drawing.color || (isDarkMode ? "#60a5fa" : "#3b82f6");
      ctx.lineWidth = drawing.lineWidth || 2;

      if (drawing.type === "line" || drawing.type === "trendline") {
        if (validPoints.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(validPoints[0].x, validPoints[0].y);
          ctx.lineTo(validPoints[1].x, validPoints[1].y);
          ctx.stroke();
        }
      } else if (drawing.type === "rectangle") {
        if (validPoints.length >= 2) {
          const x = Math.min(validPoints[0].x, validPoints[1].x);
          const y = Math.min(validPoints[0].y, validPoints[1].y);
          const width = Math.abs(validPoints[1].x - validPoints[0].x);
          const height = Math.abs(validPoints[1].y - validPoints[0].y);

          ctx.strokeRect(x, y, width, height);
          ctx.fillStyle =
            drawing.color && drawing.color.includes("rgba")
              ? drawing.color
              : isDarkMode
                ? "rgba(96, 165, 250, 0.1)"
                : "rgba(59, 130, 246, 0.1)";
          ctx.fillRect(x, y, width, height);
        }
      }
    },
    [timeToCoordinate, priceToCoordinate, isDarkMode]
  );

  // Re-render drawings when data changes
  useEffect(() => {
    renderDrawings();
  }, [renderDrawings]);

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
        pressedMouseMove: activeTool === "none", // Disable pan when drawing
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

    // Create canvas overlay for drawings
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    chartContainerRef.current.appendChild(canvas);
    canvasOverlayRef.current = canvas;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && canvasOverlayRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: 500,
        });
        canvas.width = chartContainerRef.current.clientWidth;
        canvas.height = 500;
        renderDrawings();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Subscribe to crosshair move for drawing
    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (activeTool === "none" || !isDrawing) return;

      const price = param.seriesData.get(candlestickSeries) as
        | CandlestickData
        | undefined;
      if (!price || !param.time) return;

      // Update current drawing with mouse position
      if (currentDrawing.length === 1) {
        // Update the second point while dragging
        setCurrentDrawing([
          currentDrawing[0],
          {
            time: param.time as number,
            price: price.close,
          },
        ]);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      if (canvasOverlayRef.current) {
        canvasOverlayRef.current.remove();
      }
    };
  }, [isDarkMode, activeTool]);

  // Update pan behavior when activeTool changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: activeTool === "none",
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
      });
    }
  }, [activeTool]);

  // Handle mouse events for drawing
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (activeTool === "none") return;

      const rect = chartContainerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const time = coordinateToTime(x);
      const price = coordinateToPrice(y);

      if (time === null || price === null) return;

      setIsDrawing(true);
      setCurrentDrawing([{ time, price }]);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDrawing || activeTool === "none") return;

      const rect = chartContainerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const time = coordinateToTime(x);
      const price = coordinateToPrice(y);

      if (time === null || price === null) {
        setIsDrawing(false);
        setCurrentDrawing([]);
        return;
      }

      // Complete the drawing
      const finalPoints: DrawingPoint[] =
        currentDrawing.length === 1
          ? [...currentDrawing, { time, price }]
          : currentDrawing;

      if (finalPoints.length >= 2) {
        const newDrawing: Drawing = {
          id: generateDrawingId(),
          type: activeTool as DrawingType,
          points: finalPoints,
          color: isDarkMode ? "#60a5fa" : "#3b82f6",
          lineWidth: 2,
          createdAt: Date.now(),
        };

        const updatedDrawings = [...drawings, newDrawing];
        setDrawings(updatedDrawings);
        saveDrawings(symbol, interval, updatedDrawings);
      }

      setIsDrawing(false);
      setCurrentDrawing([]);
    };

    const container = chartContainerRef.current;
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    activeTool,
    isDrawing,
    currentDrawing,
    drawings,
    symbol,
    interval,
    coordinateToTime,
    coordinateToPrice,
    isDarkMode,
  ]);

  // Update data
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    const candlestickData: CandlestickData[] = data.map((candle) => ({
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

    // Re-render drawings after data update
    setTimeout(() => renderDrawings(), 100);
  }, [data, renderDrawings]);

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
    setTimeout(() => renderDrawings(), 50);
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
    setTimeout(() => renderDrawings(), 50);
  };

  const handleResetZoom = () => {
    if (!chartRef.current) return;
    chartRef.current.timeScale().fitContent();
    setTimeout(() => renderDrawings(), 50);
  };

  const handleToolSelect = (tool: DrawingTool) => {
    setActiveTool(tool);
    setIsDrawing(false);
    setCurrentDrawing([]);
  };

  const handleClearDrawings = () => {
    clearDrawings(symbol, interval);
    setDrawings([]);
    renderDrawings();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle>{chartTitle}</CardTitle>
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
                title="Select / Pan"
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
                <Square className="h-4 w-8 p-0" />
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDrawings}
                title="Clear All Drawings"
                className="h-8 w-8 p-0"
                disabled={drawings.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={chartContainerRef}
          style={{ height: "500px", position: "relative" }}
        />
        {activeTool !== "none" && (
          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            <p>
              ✏️ {activeTool === "line" && "Click and drag to draw a line"}
              {activeTool === "rectangle" && "Click and drag to draw a rectangle"}
              {activeTool === "trendline" && "Click and drag to draw a trend line"}
            </p>
            <p className="text-xs mt-1">
              Drawings are automatically saved and will persist across page reloads.
            </p>
          </div>
        )}
        {drawings.length > 0 && (
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {drawings.length} drawing{drawings.length !== 1 ? "s" : ""} on this chart
          </div>
        )}
      </CardContent>
    </Card>
  );
}
