"use client";

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode, IChartApi } from 'lightweight-charts';

export function TVChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8899ac',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#A9DEF9', // Cotton Blue
      downColor: '#FF99C8', // Cotton Pink
      borderVisible: false,
      wickUpColor: '#A9DEF9',
      wickDownColor: '#FF99C8',
    });

    // Mock Data
    const data = [
      { time: '2023-12-22', open: 32.51, high: 33.02, low: 32.33, close: 32.61 },
      { time: '2023-12-23', open: 32.61, high: 32.81, low: 32.22, close: 32.55 },
      { time: '2023-12-24', open: 32.55, high: 32.90, low: 32.20, close: 32.75 },
      { time: '2023-12-25', open: 32.75, high: 33.50, low: 32.70, close: 33.20 },
      { time: '2023-12-26', open: 33.20, high: 33.80, low: 32.90, close: 33.05 },
      { time: '2023-12-27', open: 33.05, high: 33.95, low: 32.85, close: 33.70 },
      { time: '2023-12-28', open: 33.70, high: 34.50, low: 33.50, close: 34.10 },
      { time: '2023-12-29', open: 34.10, high: 34.80, low: 33.90, close: 34.50 },
      { time: '2023-12-30', open: 34.50, high: 35.20, low: 34.30, close: 34.90 },
    ];

    candleSeries.setData(data);

    // Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div ref={chartContainerRef} className="relative w-full h-full" />
  );
}
