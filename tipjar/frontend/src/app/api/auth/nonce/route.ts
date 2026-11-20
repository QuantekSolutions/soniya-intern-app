
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const nonce = randomBytes(16).toString("hex");
  const domain = request.nextUrl.host;

  const response = NextResponse.json({ nonce, domain });

  response.cookies.set("siwe-nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 300,
  });

  return response;
}
