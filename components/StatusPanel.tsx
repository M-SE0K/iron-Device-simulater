"use client";

import { Cpu, Clock, BarChart2, Zap } from "lucide-react";
import { AnalysisResult, AppStatus } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  status: AppStatus;
  result: AnalysisResult | null;
  currentTime: number;
}

const STATUS_LABEL: Record<AppStatus, { label: string; color: string }> = {
  idle:      { label: "IDLE",      color: "text-iron-400" },
  uploading: { label: "UPLOADING", color: "text-amber-500" },
  analyzing: { label: "ANALYZING", color: "text-brand-blue" },
  ready:     { label: "READY",     color: "text-emerald-500" },
  playing:   { label: "PLAYING",   color: "text-emerald-500" },
  paused:    { label: "PAUSED",    color: "text-amber-500" },
  error:     { label: "ERROR",     color: "text-red-500" },
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}
function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-iron-50">
      <div className="flex items-center gap-1.5 text-iron-400">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className="font-mono text-sm font-semibold text-iron-800">{value}</span>
    </div>
  );
}

export default function StatusPanel({ status, result, currentTime }: Props) {
  const { label, color } = STATUS_LABEL[status];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">System Status</span>
        <span className={cn("font-mono text-xs font-semibold tracking-widest", color)}>
          ● {label}
        </span>
      </div>

      <div className="p-4 grid grid-cols-2 gap-2">
        <StatItem
          icon={<Clock size={12} />}
          label="Playback"
          value={result ? `${formatTime(currentTime)} / ${formatTime(result.duration)}` : "--:-- / --:--"}
        />
        <StatItem
          icon={<Cpu size={12} />}
          label="Sample Rate"
          value={result ? `${(result.sampleRate / 1000).toFixed(1)} kHz` : "-- kHz"}
        />
        <StatItem
          icon={<BarChart2 size={12} />}
          label="Data Frames"
          value={result ? `${result.frames.length.toLocaleString()}` : "---"}
        />
        <StatItem
          icon={<Zap size={12} />}
          label="Resolution"
          value={result ? "100 ms" : "-- ms"}
        />
      </div>
    </div>
  );
}
