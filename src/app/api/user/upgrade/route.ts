import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { serialize } from "cookie";

export async function POST(req: NextRequest) {
  try {
    // Get the user from Auth0 session
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub;
    const body = await req.json();
    const { newRole } = body;

    // Validate the new role
    if (newRole !== "pro_user") {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Process payment through Stripe/payment provider
    // 2. Update Auth0 user metadata with new role via Management API
    // 3. Log the transaction
    //
    // For demo purposes, we're simulating the upgrade
    console.log(`[UPGRADE] User ${userId} upgraded to ${newRole}`);

    // Simulate successful upgrade
    const newPermissions = [
      "use:vision_agent",
      "use:diet_agent",
      "read:health_data",
      "write:health_data",
      "use:vision_api",
      "use:nutrition_api",
      "use:pdf_api",
    ];

    // Set demo cookie to persist role locally for demo purposes.
    const cookie = serialize("demo_role", newRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    const res = NextResponse.json(
      {
        success: true,
        message: "Upgrade successful!",
        newRole: newRole,
        newPermissions: newPermissions,
        userId: userId,
      },
      { status: 200 }
    );

    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (error) {
    console.error("[UPGRADE ERROR]", error);
    return NextResponse.json(
      { error: "Upgrade failed" },
      { status: 500 }
    );
  }
}
