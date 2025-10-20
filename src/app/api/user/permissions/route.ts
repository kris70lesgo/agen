import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getUserPermissions, getUserRole } from "@/lib/auth0-fga";

export async function GET() {
  try {
    // Check authentication
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user permissions and role
    const permissions = await getUserPermissions();
    const role = await getUserRole();

    return NextResponse.json({
      permissions,
      role,
      userId: session.user.sub,
    });
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return NextResponse.json(
      { error: "Failed to get permissions" },
      { status: 500 }
    );
  }
}
