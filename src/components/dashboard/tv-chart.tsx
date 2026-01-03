"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode, IChartApi } from 'lightweight-charts';
import { useTradingStore } from "@/store/useTradingStore";

export const TVChart = React.memo(function TVChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<any>(null);
  const { mode, apiKey } = useTradingStore(); // Get current mode (PAPER/LIVE)

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
        mode: CrosshairMode.Magnet,
        vertLine: {
            width: 1,
            color: 'rgba(255, 255, 255, 0.4)',
            style: 0,
        },
        horzLine: {
            visible: false,
            labelVisible: false,
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    });

    chartRef.current = chart;

    const areaSeries = chart.addAreaSeries({
      topColor: mode === 'PAPER' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(34, 197, 94, 0.4)', // Yellow/Green based on mode
      bottomColor: 'rgba(0, 0, 0, 0)',
      lineColor: mode === 'PAPER' ? '#EAB308' : '#22C55E',
      lineWidth: 2,
    });
    
    areaSeriesRef.current = areaSeries;

    // Fetch Historical Data
    const fetchHistory = async () => {
        try {
            // Using direct fetch for simplicity, aligned with existing app patterns
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021';
            const res = await fetch(`${API_URL}/api/portfolio/history`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            
            if (!res.ok) {
                // If endpoint missing or server error, stop here
                return;
            }

            const history = await res.json();
            
            // Transform data for chart
            const chartData = history.map((item: any) => ({
                time: item.timestamp / 1000, // Lightweight charts uses unix timestamp in seconds
                value: mode === 'PAPER' ? item.paperValue : (item.liveValue || 0)
            }));

            // Ensure data is sorted by time and unique (Lightweight charts requirement)
            const uniqueData = chartData.filter((v:any, i:any, a:any) => a.findIndex((t:any) => (t.time === v.time)) === i).sort((a:any, b:any) => a.time - b.time);

            areaSeries.setData(uniqueData);
            chart.timeScale().fitContent();
        } catch (e) {
            console.error("Failed to load chart history", e);
        }
    };

    fetchHistory();

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
  }, [mode]); // Re-create chart if mode changes to update colors/data

  // Socket Listener for Real-time Updates
  // Note: ideally we move socket logic to a hook, but for now we attach here if global socket exists
  // For this specific artifact, I'll rely on the re-fetch or use a polling interval for simplicity unless verify socket prop availability
  // Using Polling for reliability in this specific file scope without refactoring Layout
  useEffect(() => {
     if(!areaSeriesRef.current) return;
     
     const interval = setInterval(async () => {
         try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021';
            const res = await fetch(`${API_URL}/api/portfolio/history`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            if (res.ok) {
                const history = await res.json();
                if(history.length > 0) {
                     const latest = history[history.length - 1];
                     const point = {
                         time: latest.timestamp / 1000,
                         value: mode === 'PAPER' ? latest.paperValue : (latest.liveValue || 0)
                     };
                     // update() is more efficient than setData() for appending
                     areaSeriesRef.current.update(point);
                }
            }
         } catch(e) {}
     }, 5000); // Sync with backend 5s interval

     return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="relative w-full h-full">
         <div className="top-2 left-2 z-10 absolute bg-black/40 backdrop-blur-sm px-2 py-1 border border-white/10 rounded">
             <span className={`text-[10px] font-mono font-bold ${mode === 'PAPER' ? 'text-yellow-500' : 'text-green-500'}`}>
                 {mode === 'PAPER' ? 'PAPER P/L' : 'LIVE P/L'}
             </span>
         </div>
        <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
});
