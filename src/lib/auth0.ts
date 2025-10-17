import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  async onCallback(error, context, session) {
    if (error) {
      console.error('Authentication error:', error);
      return NextResponse.redirect(
        new URL('/', process.env.APP_BASE_URL!)
      );
    }

    // Redirect to returnTo parameter or dashboard after successful authentication
    const returnTo = context.returnTo || "/dashboard";
    
    if (session) {
      console.log(`User ${session.user.sub} logged in successfully`);
    }

    return NextResponse.redirect(
      new URL(returnTo, process.env.APP_BASE_URL!)
    );
  }
});
