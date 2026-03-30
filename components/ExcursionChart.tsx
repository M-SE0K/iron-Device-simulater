"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Activity } from "lucide-react";
import { AnalysisFrame } from "@/lib/types";
import { findFrameIndex } from "@/lib/utils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface Props {
  frames: AnalysisFrame[];
  currentTime: number;
  isActive: boolean;
}

const MAX_EXCURSION = 8; // mm

export default function ExcursionChart({ frames, currentTime, isActive }: Props) {
  const frameIdx = useMemo(
    () => (isActive ? findFrameIndex(frames.map((f) => f.time), currentTime) : -1),
    [frames, currentTime, isActive]
  );

  const currentExc = frameIdx >= 0 ? frames[frameIdx]?.excursion ?? null : null;
  const excColor = currentExc !== null && Math.abs(currentExc) > MAX_EXCURSION * 0.85
    ? "#EF4444"
    : "#10B981";

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
      name: "mm",
      nameTextStyle: { color: "#A4AABA", fontSize: 10 },
      axisLabel: { color: "#A4AABA", fontSize: 10 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#F5F6F8" } },
      min: -MAX_EXCURSION - 1,
      max: MAX_EXCURSION + 1,
    },
    series: [
      {
        type: "line",
        data: windowFrames.map((f) => [f.time, f.excursion]),
        smooth: 0.3,
        symbol: "none",
        lineStyle: { color: "#10B981", width: 1.5 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16,185,129,0.15)" },
              { offset: 1, color: "rgba(16,185,129,0)" },
            ],
          },
        },
        markLine: {
          silent: true,
          symbol: "none",
          data: [
            {
              yAxis: MAX_EXCURSION,
              lineStyle: { color: "#EF4444", type: "dashed", width: 1 },
              label: { formatter: `+${MAX_EXCURSION}mm`, color: "#EF4444", fontSize: 9 },
            },
            {
              yAxis: -MAX_EXCURSION,
              lineStyle: { color: "#EF4444", type: "dashed", width: 1 },
              label: { formatter: `-${MAX_EXCURSION}mm`, color: "#EF4444", fontSize: 9 },
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
        return `${t.toFixed(2)}s &nbsp; <b>${v.toFixed(3)} mm</b>`;
      },
    },
  }), [windowFrames]);

  return (
    <div className="card flex flex-col h-full">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-iron-400" />
          <span className="card-title">Excursion</span>
        </div>
        {currentExc !== null && (
          <span className="font-mono text-lg font-semibold" style={{ color: excColor }}>
            {currentExc.toFixed(2)}<span className="text-xs ml-0.5 font-normal">mm</span>
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
