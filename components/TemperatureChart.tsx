"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Thermometer } from "lucide-react";
import { AnalysisFrame } from "@/lib/types";
import { findFrameIndex } from "@/lib/utils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface Props {
  frames: AnalysisFrame[];
  currentTime: number;
  isActive: boolean;
}

const WARN_THRESHOLD = 65;
const DANGER_THRESHOLD = 75;

export default function TemperatureChart({ frames, currentTime, isActive }: Props) {
  const frameIdx = useMemo(
    () => (isActive ? findFrameIndex(frames.map((f) => f.time), currentTime) : -1),
    [frames, currentTime, isActive]
  );

  const currentTemp = frameIdx >= 0 ? frames[frameIdx]?.temperature ?? null : null;
  const tempColor =
    currentTemp === null
      ? "#7D8699"
      : currentTemp >= DANGER_THRESHOLD
      ? "#EF4444"
      : currentTemp >= WARN_THRESHOLD
      ? "#F59E0B"
      : "#0057B8";

  // Sliding window: show last 10 seconds
  const windowFrames = useMemo(() => {
    if (!isActive || frameIdx < 0) return frames.slice(0, 100);
    const start = Math.max(0, frameIdx - 99);
    return frames.slice(start, frameIdx + 1);
  }, [frames, frameIdx, isActive]);

  const option = useMemo(() => ({
    animation: false,
    grid: { top: 8, right: 16, bottom: 32, left: 52 },
    xAxis: {
      type: "value",
      min: windowFrames[0]?.time ?? 0,
      max: windowFrames[windowFrames.length - 1]?.time ?? 10,
      axisLabel: { formatter: (v: number) => `${v.toFixed(1)}s`, color: "#A4AABA", fontSize: 10 },
      axisLine: { lineStyle: { color: "#E8EAF0" } },
      splitLine: { lineStyle: { color: "#F5F6F8" } },
    },
    yAxis: {
      type: "value",
      name: "°C",
      nameTextStyle: { color: "#A4AABA", fontSize: 10 },
      axisLabel: { color: "#A4AABA", fontSize: 10 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#F5F6F8" } },
      min: 30,
      max: 90,
    },
    series: [
      {
        type: "line",
        data: windowFrames.map((f) => [f.time, f.temperature]),
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#0057B8", width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(0,87,184,0.18)" },
              { offset: 1, color: "rgba(0,87,184,0)" },
            ],
          },
        },
        // Danger zone mark line
        markLine: {
          silent: true,
          symbol: "none",
          data: [
            {
              yAxis: WARN_THRESHOLD,
              lineStyle: { color: "#F59E0B", type: "dashed", width: 1 },
              label: { formatter: "WARN", color: "#F59E0B", fontSize: 9 },
            },
            {
              yAxis: DANGER_THRESHOLD,
              lineStyle: { color: "#EF4444", type: "dashed", width: 1 },
              label: { formatter: "DANGER", color: "#EF4444", fontSize: 9 },
            },
          ],
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1A1D23",
      borderColor: "#2E3440",
      textStyle: { color: "#E8EAF0", fontSize: 11, fontFamily: "JetBrains Mono" },
      formatter: (params: { data: [number, number] }[]) => {
        const [t, v] = params[0].data;
        return `${t.toFixed(2)}s &nbsp; <b>${v.toFixed(1)} °C</b>`;
      },
    },
  }), [windowFrames]);

  return (
    <div className="card flex flex-col h-full">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Thermometer size={14} className="text-iron-400" />
          <span className="card-title">Temperature</span>
        </div>
        {currentTemp !== null && (
          <span className="font-mono text-lg font-semibold" style={{ color: tempColor }}>
            {currentTemp.toFixed(1)}<span className="text-xs ml-0.5 font-normal">°C</span>
          </span>
        )}
      </div>

      <div className="flex-1 p-2 min-h-[180px]">
        {frames.length > 0 ? (
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} notMerge />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-iron-300">
            분석 데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}
