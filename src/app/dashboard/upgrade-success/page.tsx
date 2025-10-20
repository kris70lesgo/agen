import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { UpgradeSuccessClient } from "./UpgradeSuccessClient";

export const metadata = {
  title: "Upgrade Successful | Health Agent",
  description: "Welcome to Pro! Enjoy unlimited access.",
};

export default async function UpgradeSuccessPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/api/auth/login");
  }

  return (
    <div className="w-full">
      <UpgradeSuccessClient />
    </div>
  );
}
