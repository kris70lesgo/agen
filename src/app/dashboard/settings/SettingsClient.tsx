"use client";

import { useState, useEffect } from "react";
import { IconHome, IconShieldCheck, IconKey, IconUser, IconCrown, IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface SettingsClientProps {
  session: {
    user?: {
      email?: string;
      name?: string;
      picture?: string;
      sub?: string;
    };
  } | null;
}

interface PermissionInfo {
  permissions: string[];
  role: string;
}

export default function SettingsClient({ session }: SettingsClientProps) {
  const [permissionInfo, setPermissionInfo] = useState<PermissionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/user/permissions');
      if (response.ok) {
        const data = await response.json();
        setPermissionInfo(data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07071A] text-neutral-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(90,50,200,0.65)_0%,_rgba(7,7,26,0.9)_45%,_rgba(2,2,10,1)_100%)]" />

      {/* Header with Home Button */}
      <header className="sticky top-6 z-50 flex justify-between items-center px-6 py-4">
        <h1 className="text-3xl font-bold">Settings & Permissions</h1>
        <a
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl transition-all hover:bg-white/20"
        >
          <IconHome size={20} />
          <span>Dashboard</span>
        </a>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl px-6 pb-24 pt-12">
        <div className="space-y-6">
          {/* User Info Section */}
          <div className="rounded-2xl border border-white/12 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <IconUser className="text-purple-400" size={24} />
              <h2 className="text-xl font-semibold">User Information</h2>
            </div>
            <div className="space-y-2 text-gray-300">
              <p><strong>Name:</strong> {session?.user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {session?.user?.email || 'N/A'}</p>
              <p><strong>User ID:</strong> <code className="text-xs bg-white/10 px-2 py-1 rounded">{session?.user?.sub}</code></p>
            </div>
          </div>

          {/* Role Section */}
          <div className="rounded-2xl border border-white/12 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <IconShieldCheck className="text-cyan-400" size={24} />
              <h2 className="text-xl font-semibold">Current Role</h2>
            </div>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              <div className="flex items-center gap-4">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  permissionInfo?.role === 'pro_user'
                    ? 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-500/50'
                    : 'bg-gray-500/20 border border-gray-500/30'
                }`}>
                  {permissionInfo?.role === 'pro_user' ? (
                    <span className="flex items-center gap-2">
                      <IconCrown size={16} />
                      PRO USER
                    </span>
                  ) : (
                    'FREE USER'
                  )}
                </span>
                {permissionInfo?.role === 'free_user' && (
                  <button 
                    onClick={() => router.push('/dashboard/pricing')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    <IconCrown size={16} />
                    Upgrade to Pro
                    <IconArrowRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Permissions Section */}
          <div className="rounded-2xl border border-white/12 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-4">
              <IconKey className="text-yellow-400" size={24} />
              <h2 className="text-xl font-semibold">Your Permissions</h2>
            </div>
            {loading ? (
              <p className="text-gray-400">Loading permissions...</p>
            ) : (
              <div className="space-y-2">
                {permissionInfo?.permissions && permissionInfo.permissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissionInfo.permissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <code className="text-sm text-gray-300">{permission}</code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No permissions found</p>
                )}
              </div>
            )}
          </div>

          {/* Permission Descriptions */}
          <div className="rounded-2xl border border-white/12 bg-white/5 p-6 backdrop-blur-xl">
            <h3 className="text-lg font-semibold mb-4">Permission Guide</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <strong className="text-purple-300">use:vision_agent</strong>
                <p className="text-gray-400 mt-1">Access to Med Scan AI for medical image analysis</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <strong className="text-cyan-300">use:diet_agent</strong>
                <p className="text-gray-400 mt-1">Access to Weekly Diet Agent for personalized meal plans</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <strong className="text-green-300">read:health_data</strong>
                <p className="text-gray-400 mt-1">View your health records and dietary data</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <strong className="text-blue-300">write:health_data</strong>
                <p className="text-gray-400 mt-1">Create and modify health records</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <strong className="text-yellow-300">manage:tokens</strong>
                <p className="text-gray-400 mt-1">Manage API tokens and integrations (Admin only)</p>
              </div>
            </div>
          </div>

          {/* Token Management (Coming Soon) */}
          <div className="rounded-2xl border border-white/12 bg-white/5 p-6 backdrop-blur-xl opacity-50">
            <h3 className="text-lg font-semibold mb-4">API Token Management</h3>
            <p className="text-gray-400">Coming soon: Manage your API tokens securely</p>
          </div>
        </div>
      </main>
    </div>
  );
}
