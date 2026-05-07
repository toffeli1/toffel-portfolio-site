import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
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
          background: "#faf7f2",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 132,
            fontWeight: 700,
            color: "#111111",
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        >
          Toffel Capital
        </div>
        <div
          style={{
            width: 120,
            height: 1,
            background: "#5a6e82",
            margin: "36px 0",
          }}
        />
        <div
          style={{
            fontSize: 30,
            color: "#5a6e82",
            letterSpacing: "0.005em",
          }}
        >
          Investment Portfolio · Documented Process
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 44,
            right: 60,
            fontSize: 14,
            color: "#7a8799",
            fontFamily: "monospace",
            letterSpacing: "0.05em",
          }}
        >
          toffelcapital.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
