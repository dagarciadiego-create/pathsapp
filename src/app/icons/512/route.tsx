import { ImageResponse } from "next/og";
import { brandIconElement } from "@/lib/brand-icon";

const SIZE = 512;

export async function GET() {
  return new ImageResponse(brandIconElement(SIZE), { width: SIZE, height: SIZE });
}
