import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  const cookie = serialize("demo_role", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  const res = NextResponse.json({ success: true, message: "Cleared demo role" });
  res.headers.set("Set-Cookie", cookie);
  return res;
}
