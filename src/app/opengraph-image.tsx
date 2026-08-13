import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 28,
            background: "#1c5e3d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 44,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              background: "#ffffff",
              clipPath: "polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#142720",
            letterSpacing: "-0.02em",
          }}
        >
          사랑과 평안의 교회
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#5c6b62",
            marginTop: 18,
          }}
        >
          가족과 함께하는 은혜로운 예배 기록
        </div>
      </div>
    ),
    { ...size }
  );
}
