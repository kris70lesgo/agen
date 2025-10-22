"use client";

import Particles from "@/components/Particles";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

// Separate client component for interactive features
function MainContent({ session }: { session: { user?: { email?: string; name?: string } } | null }) {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Particles background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 mix-blend-soft-light bg-[radial-gradient(circle_at_50%_0%,rgba(88,131,241,0.32)_0%,rgba(10,9,30,0.9)_52%,rgba(4,3,15,1)_88%)]" />
        <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
          <Particles
            particleColors={['#ffffff', '#ffffff']}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[-18%] h-[70%] mix-blend-screen bg-[radial-gradient(circle,_rgba(122,214,255,0.3)_0%,rgba(20,18,48,0.55)_46%,rgba(7,6,24,0.92)_82%)] blur-3xl" />
      </div>

      {/* Text and buttons */}
      <div className="relative z-20 flex max-w-3xl flex-col items-center text-center">
        <h1 className="block text-balance text-4xl font-bold leading-tight sm:text-5xl md:text-6xl text-white [text-shadow:_0_2px_4px_rgba(0,0,0,0.5)] [WebkitTextStroke:1px_black]">
          AI-Powered Health Analysis & Nutrition Planning
        </h1>
        <p className="mt-4 text-gray-400 text-lg max-w-2xl leading-relaxed">
          MedHack transforms your medical data into actionable insights — from detecting conditions to creating personalized diet plans in one secure platform.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <HoverBorderGradient
            containerClassName="rounded-full border border-white/20"
            as="button"
            className="flex items-center gap-2 bg-white px-5 py-2 text-sm font-semibold text-black dark:bg-black dark:text-white"
          >
            <ButtonLogo />
            <span>Live product tour</span>
          </HoverBorderGradient>
          {session ? (
            <a href="/dashboard">
              <RainbowButton variant="dark" className="px-6 py-2 text-sm font-semibold">
                Go to Dashboard
              </RainbowButton>
            </a>
          ) : (
            <a href="/auth/login?screen_hint=signup&returnTo=/dashboard">
              <RainbowButton variant="dark" className="px-6 py-2 text-sm font-semibold">
                Get Started
              </RainbowButton>
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

const ButtonLogo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 66 65"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-black dark:text-white"
  >
    <path
      d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696"
      stroke="currentColor"
      strokeWidth="12"
      strokeMiterlimit="3.86874"
      strokeLinecap="round"
    />
  </svg>
);

export default MainContent;
