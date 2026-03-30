import { NextRequest, NextResponse } from "next/server";
import { generateMockAnalysis } from "@/lib/mock-data";

/**
 * POST /api/analyze
 * - 실제 환경: multipart/form-data로 오디오 파일 수신 → .so 라이브러리 호출 → 분석 결과 반환
 * - 스켈레톤: Mock 데이터 반환 (랜덤 지연 포함)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // TODO: 실제 .so 라이브러리 연동 코드로 교체
    // const buffer = Buffer.from(await file.arrayBuffer());
    // const result = await callNativeLib(buffer);

    // Simulate analysis delay (500ms ~ 2s)
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1500));

    const result = generateMockAnalysis(30);
    result.filename = file.name;

    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyze] error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
