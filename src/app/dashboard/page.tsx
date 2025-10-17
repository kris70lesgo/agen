import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
const session = await auth0.getSession();

// Redirect to login if not authenticated
if (!session) {
redirect("/auth/login?returnTo=/dashboard");
}

return <DashboardClient session={session} />;
}
