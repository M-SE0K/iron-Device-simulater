"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import AudioUploader from "@/components/AudioUploader";
import AnalyzeButton from "@/components/AnalyzeButton";
import WaveformPlayer from "@/components/WaveformPlayer";
import TemperatureChart from "@/components/TemperatureChart";
import ExcursionChart from "@/components/ExcursionChart";
import StatusPanel from "@/components/StatusPanel";
import { AppStatus, AnalysisResult } from "@/lib/types";

export default function DashboardPage() {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 파일 선택
  const handleFileSelected = useCallback((file: File) => {
    setAudioFile(file);
    setAnalysisResult(null);
    setCurrentTime(0);
    setStatus("idle");
    setErrorMsg(null);
  }, []);

  // 초기화
  const handleReset = useCallback(() => {
    setAudioFile(null);
    setAnalysisResult(null);
    setCurrentTime(0);
    setStatus("idle");
    setErrorMsg(null);
  }, []);

  // 분석 요청
  const handleAnalyze = useCallback(async () => {
    if (!audioFile) return;

    try {
      setStatus("uploading");
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("audio", audioFile);

      setStatus("analyzing");
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const result: AnalysisResult = await res.json();
      setAnalysisResult(result);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, [audioFile]);

  const isPlaying = status === "playing";
  const frames = analysisResult?.frames ?? [];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />

      <main className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="max-w-screen-xl mx-auto h-full flex flex-col gap-4">

          {/* Top row: uploader + status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Upload + Analyze */}
            <div className="md:col-span-2 space-y-3">
              <AudioUploader
                status={status}
                selectedFile={audioFile}
                onFileSelected={handleFileSelected}
                onReset={handleReset}
              />
              <AnalyzeButton
                status={status}
                hasFile={!!audioFile}
                onClick={handleAnalyze}
              />
              {errorMsg && (
                <p className="text-xs text-red-500 px-1">오류: {errorMsg}</p>
              )}
            </div>

            {/* Status panel */}
            <StatusPanel
              status={status}
              result={analysisResult}
              currentTime={currentTime}
            />
          </div>

          {/* Waveform player */}
          <WaveformPlayer
            audioFile={audioFile}
            status={status}
            onTimeUpdate={setCurrentTime}
            onStatusChange={setStatus}
          />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
            <TemperatureChart
              frames={frames}
              currentTime={currentTime}
              isActive={isPlaying || status === "paused"}
            />
            <ExcursionChart
              frames={frames}
              currentTime={currentTime}
              isActive={isPlaying || status === "paused"}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
