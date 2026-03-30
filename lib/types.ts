/** 오디오 분석 결과 한 프레임 */
export interface AnalysisFrame {
  /** 오디오 재생 시간(초) */
  time: number;
  /** 칩 온도 (°C) */
  temperature: number;
  /** 스피커 진폭 변위 (mm) */
  excursion: number;
}

/** 업로드 → 분석 → 시각화 상태 */
export type AppStatus =
  | "idle"       // 파일 업로드 전
  | "uploading"  // 파일 업로드 중
  | "analyzing"  // 서버에서 분석 중
  | "ready"      // 분석 완료, 재생 가능
  | "playing"    // 재생 중
  | "paused"     // 일시정지
  | "error";     // 에러

export interface AnalysisResult {
  filename: string;
  duration: number;   // 전체 길이(초)
  sampleRate: number;
  frames: AnalysisFrame[];
}
