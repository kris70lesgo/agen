"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconArrowRight, IconCrown } from "@tabler/icons-react";

export function UpgradeSuccessClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Simulate loading delay for dramatic effect
    const timer = setTimeout(() => {
      setNewPermissions([
        "🎬 Med Scan - Medical Image Analysis (Unlimited)",
        "🍽️ Weekly Diet Agent - AI Meal Planning",
        "📊 Full Health Data Access - Read & Write",
        "⚡ Priority API Access - Faster responses",
        "📧 Email Support - Get help when you need it",
        "📄 PDF Export - Download your meal plans",
        "🔄 Token Management - Advanced features",
      ]);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05050F] flex items-center justify-center">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_center,_rgba(90,50,230,0.4)_0%,_rgba(6,6,18,0.9)_55%,_rgba(3,3,11,1)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[25%] -z-20 h-[50rem] rounded-full bg-[radial-gradient(circle,_rgba(120,220,255,0.15)_0%,_rgba(5,5,15,0)_70%)] blur-[140px]" />

      <main className="relative z-10 px-4 py-12">
        <div className="max-w-2xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className={`relative w-24 h-24 rounded-full transition-all duration-500 ${
              isLoading
                ? "bg-purple-500/20 border-2 border-purple-500/50"
                : "bg-green-500/20 border-2 border-green-500"
            }`}>
              {!isLoading && (
                <div className="absolute inset-0 flex items-center justify-center animate-bounce">
                  <IconCheck size={48} className="text-green-400" />
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Main Text */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <IconCrown size={40} className="text-purple-400" />
              Welcome to Pro!
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Your upgrade was successful
            </p>
            <p className="text-gray-400">
              You now have access to all premium features and priority support
            </p>
          </div>

          {/* New Features */}
          {!isLoading && (
            <div className="mb-12 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">
                Your New Superpowers
              </h2>
              <div className="grid gap-3">
                {newPermissions.map((permission, index) => (
                  <div
                    key={index}
                    className="p-4 border border-green-500/30 rounded-lg bg-green-500/5 backdrop-blur-sm flex items-start gap-3 hover:bg-green-500/10 transition-all"
                    style={{
                      animation: `slideInLeft 0.5s ease-out ${index * 50}ms both`,
                    }}
                  >
                    <IconCheck size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-200">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
            >
              View New Permissions
              <IconArrowRight size={20} />
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-3 rounded-lg font-semibold border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Tips */}
          <div className="mt-12 p-6 border border-blue-500/20 rounded-lg bg-blue-500/5 backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Visit the <strong>Med Scan</strong> to analyze medical images</li>
              <li>• Try the <strong>Weekly Diet Agent</strong> for AI meal planning</li>
              <li>• Go to <strong>Settings</strong> to see all your new permissions</li>
              <li>• Explore the <strong>DietPlan</strong> section for personalized recommendations</li>
            </ul>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
