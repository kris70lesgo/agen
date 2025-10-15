"use client";

import React, { useRef, useState } from "react";
import Prism from "@/components/Prism";
import VariableProximity from "@/components/VariableProximity";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const navItems = [
  { name: "Features", link: "#features" },
  { name: "Pricing", link: "#pricing" },
  { name: "Contact", link: "#contact" },
];

export default function Page() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05050F] text-white">
      {/* Distant violet-blue background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top,_rgba(90,50,230,0.4)_0%,_rgba(6,6,18,0.9)_55%,_rgba(3,3,11,1)_100%)]" />
      {/* Dim cyan aura — very subtle now */}
      <div className="pointer-events-none absolute inset-x-0 top-[35%] -z-20 h-[40rem] rounded-full bg-[radial-gradient(circle,_rgba(120,220,255,0.12)_0%,_rgba(5,5,15,0)_70%)] blur-[140px]" />

      {/* Navbar */}
      <header className="pointer-events-none absolute inset-x-0 top-6 z-40 flex justify-center px-6">
        <div className="pointer-events-auto w-full max-w-5xl rounded-full border border-white/10 bg-white/10 shadow-[0_12px_40px_rgba(12,10,32,0.45)] backdrop-blur-2xl backdrop-saturate-150">
          <Navbar className="top-0">
            <NavBody>
              <NavbarLogo />
              <NavItems
                items={navItems}
                onItemClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="hidden items-center gap-3 md:flex">
                <NavbarButton
                  variant="secondary"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Login
                </NavbarButton>
                <NavbarButton
                  variant="primary"
                  className="bg-white text-neutral-900 hover:bg-neutral-200"
                >
                  Book a call
                </NavbarButton>
              </div>
            </NavBody>

            <MobileNav>
              <MobileNavHeader>
                <NavbarLogo />
                <MobileNavToggle
                  isOpen={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                />
              </MobileNavHeader>

              <MobileNavMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                className="bg-white/10 backdrop-blur-2xl"
              >
                {navItems.map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative text-neutral-200 transition-colors hover:text-white"
                  >
                    <span className="block">{item.name}</span>
                  </a>
                ))}
                <div className="flex w-full flex-col gap-3">
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    Login
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full bg-white text-neutral-900 hover:bg-neutral-200"
                  >
                    Book a call
                  </NavbarButton>
                </div>
              </MobileNavMenu>
            </MobileNav>
          </Navbar>
        </div>
      </header>

      {/* MAIN SECTION */}
      <main
        ref={containerRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* Prism background */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 mix-blend-soft-light bg-[radial-gradient(circle_at_50%_0%,rgba(88,131,241,0.32)_0%,rgba(10,9,30,0.9)_52%,rgba(4,3,15,1)_88%)]" />
          <Prism
            animationType="rotate"
            timeScale={0.35}
            height={4.2}
            baseWidth={5.2}
            scale={3.2}
            hueShift={0.35}
            colorFrequency={1.6}
            noise={0.08}
            glow={1.4}
            bloom={1.6}
            transparent={true}
            suspendWhenOffscreen={false}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-[-18%] h-[70%] mix-blend-screen bg-[radial-gradient(circle,_rgba(122,214,255,0.3)_0%,rgba(20,18,48,0.55)_46%,rgba(7,6,24,0.92)_82%)] blur-3xl" />
        </div>

        {/* Text and buttons */}
        <div className="relative z-20 flex max-w-3xl flex-col items-center text-center">
          <VariableProximity
            label={"Personalized nutrition guidance that adapts with every check-in"}
            className="variable-proximity-demo block text-balance text-4xl leading-tight sm:text-5xl md:text-6xl"
            fromFontVariationSettings={`'wght' 320, 'opsz' 10`}
            toFontVariationSettings={`'wght' 1000, 'opsz' 68`}
            containerRef={containerRef}
            radius={180}
            falloff="gaussian"
            intensity={0.65}
          />
          <p className="mt-5 max-w-xl text-balance font-sans text-base text-neutral-400">
            Launch diet plans that stay in sync with your clients—AI-crafted, coach-approved, and ready to send in seconds.
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
            <RainbowButton variant="dark" className="px-6 py-2 text-sm font-semibold">
              Get Started
            </RainbowButton>
          </div>
        </div>
      </main>
    </div>
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
