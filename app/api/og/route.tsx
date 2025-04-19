import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 40,
        background: "linear-gradient(to bottom, #8b5cf6, #6366f1)",
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <div style={{ fontSize: 60, fontWeight: "bold", marginBottom: "20px" }}>Union Vouching Graph</div>
      <div style={{ fontSize: 30, opacity: 0.8 }}>Interactive visualization of Union vouching relationships</div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
