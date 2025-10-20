"use client";

import { useState } from "react";
import { IconCheck, IconArrowRight, IconCrown } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Med Scan (Medical Image Analysis)",
      "Limited API access",
      "Read your health data",
      "Community support",
    ],
    cta: "Current Plan",
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "Everything you need to get the most out of your health",
    features: [
      "Med Scan (Unlimited)",
      "Weekly Diet Agent",
      "AI-Powered Meal Planning",
      "Full health data access",
      "Priority API access",
      "Email support",
      "PDF export",
      "24/7 access",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

export function PricingClient({
  userRole,
}: {
  userRole: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newRole: "pro_user" }),
      });

      if (!response.ok) {
        throw new Error("Failed to upgrade");
      }

      const data = await response.json();
      console.log("Upgrade successful:", data);

      // Redirect to success page
      router.push("/dashboard/upgrade-success");
    } catch (error) {
      console.error("Error upgrading:", error);
      alert("Failed to upgrade. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05050F]">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top,_rgba(90,50,230,0.4)_0%,_rgba(6,6,18,0.9)_55%,_rgba(3,3,11,1)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[35%] -z-20 h-[40rem] rounded-full bg-[radial-gradient(circle,_rgba(120,220,255,0.12)_0%,_rgba(5,5,15,0)_70%)] blur-[140px]" />

      <main className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the plan that works best for you and unlock powerful health insights
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all ${
                tier.highlighted
                  ? "border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/30 to-blue-900/30 shadow-2xl shadow-purple-500/20 md:scale-105"
                  : "border border-white/10 bg-white/5 hover:bg-white/10"
              } backdrop-blur-xl`}
            >
              {/* Badge */}
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <IconCrown size={16} />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{tier.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                {tier.price !== "$0" && (
                  <span className="text-gray-400 text-sm">/month</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <IconCheck size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={handleUpgrade}
                disabled={isLoading || userRole === "pro_user" || tier.name === "Free"}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  tier.highlighted
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
                    : "bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin">⚙️</div>
                    Processing...
                  </>
                ) : userRole === "pro_user" ? (
                  <>
                    <IconCheck size={20} />
                    Already Pro
                  </>
                ) : (
                  <>
                    {tier.cta}
                    <IconArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I upgrade or downgrade anytime?",
                a: "Yes! You can change your plan at any time. Changes take effect immediately.",
              },
              {
                q: "Is there a free trial?",
                a: "The Free tier gives you full access to Med Scan. Upgrade to Pro to unlock Diet Agent and more.",
              },
              {
                q: "What payment methods do you accept?",
                a: "For this demo, upgrades are instant. In production, we support all major credit cards and payment methods.",
              },
              {
                q: "Do I get support?",
                a: "Free users get community support. Pro users get priority email support.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-lg p-4 bg-white/5 backdrop-blur-sm"
              >
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
