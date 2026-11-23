
import { NextRequest, NextResponse } from "next/server";
import { SiweMessage } from "siwe";

const SEPOLIA_CHAIN_ID = 11155111;

function createResponse(
  body: object,
  status: number = 200
) {
  const response = NextResponse.json(body, { status });

  response.cookies.set("siwe-nonce", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function POST(request: NextRequest) {
  const nonce = request.cookies.get("siwe-nonce")?.value;

  if (!nonce) {
    return NextResponse.json(
      {
        success: false,
        message: "Nonce missing or expired. Please try again.",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { message, signature } = body;

    if (
      typeof message !== "string" ||
      typeof signature !== "string"
    ) {
      return createResponse(
        { success: false, message: "Invalid request data." },
        400
      );
    }

    const siweMessage = new SiweMessage(message);
    const domain = request.nextUrl.host;

    if (siweMessage.chainId !== SEPOLIA_CHAIN_ID) {
      return createResponse(
        { success: false, message: "Please sign in using Sepolia." },
        400
      );
    }

    const verification = await siweMessage.verify({
      signature,
      domain,
      nonce,
    });

    if (!verification.success) {
      return createResponse(
        { success: false, message: "Signature verification failed." },
        401
      );
    }

    return createResponse({
      success: true,
      message: "Wallet ownership verified successfully!",
      address: verification.data.address,
    });
  } catch (error) {
    console.error("SIWE verification error:", error);

    return createResponse(
      {
        success: false,
        message: "Invalid SIWE message or signature.",
      },
      401
    );
  }
}
