import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { PricingClient } from "./PricingClient";

export const metadata = {
  title: "Upgrade to Pro | Health Agent",
  description: "Unlock unlimited access to all features",
};

export default async function PricingPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/api/auth/login");
  }

  const userRole = session.user?.[`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/role`];

  return (
    <div className="w-full">
      <PricingClient userRole={userRole} />
    </div>
  );
}
