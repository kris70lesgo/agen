import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import VisionClient from "./VisionClient";

export default async function VisionPage() {
	const session = await auth0.getSession();

	// Redirect to login if not authenticated
	if (!session) {
		redirect("/auth/login?returnTo=/dashboard/vision");
	}

	return <VisionClient session={session} />;
}
