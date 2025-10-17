"use client";

import React, { useState } from "react";
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

const navItems = [
  { name: "Features", link: "#features" },
  { name: "Pricing", link: "#pricing" },
  { name: "Contact", link: "#contact" },
];

interface MainNavbarProps {
  session: {
    user?: {
      email?: string;
      name?: string;
    };
  } | null;
}

export function MainNavbar({ session }: MainNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-6 z-40 flex justify-center px-6">
      <div className="pointer-events-auto w-full max-w-5xl rounded-full border border-white/10 bg-white/10 shadow-[0_12px_40px_rgba(12,10,32,0.45)] backdrop-blur-2xl backdrop-saturate-150">
        <Navbar className="top-0">
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="hidden items-center gap-3 md:flex">
              {session ? (
                <>
                  <span className="text-sm text-white/80">
                    Welcome, {session.user?.name || session.user?.email || 'User'}
                  </span>
                  <NavbarButton
                    href="/auth/logout"
                    variant="secondary"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    Logout
                  </NavbarButton>
                </>
              ) : (
                <>
                  <NavbarButton
                    href="/auth/login?returnTo=/dashboard"
                    variant="secondary"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    Login
                  </NavbarButton>
                  <NavbarButton
                    href="/auth/login?screen_hint=signup&returnTo=/dashboard"
                    variant="primary"
                    className="bg-white text-neutral-900 hover:bg-neutral-200"
                  >
                    Sign Up
                  </NavbarButton>
                </>
              )}
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
                {session ? (
                  <>
                    <div className="text-center text-sm text-white/80">
                      Welcome, {session.user?.name || session.user?.email || 'User'}
                    </div>
                    <NavbarButton
                      href="/auth/logout"
                      variant="primary"
                      className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    >
                      Logout
                    </NavbarButton>
                  </>
                ) : (
                  <>
                    <NavbarButton
                      href="/auth/login?returnTo=/dashboard"
                      variant="primary"
                      className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    >
                      Login
                    </NavbarButton>
                    <NavbarButton
                      href="/auth/login?screen_hint=signup&returnTo=/dashboard"
                      variant="primary"
                      className="w-full bg-white text-neutral-900 hover:bg-neutral-200"
                    >
                      Sign Up
                    </NavbarButton>
                  </>
                )}
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </div>
    </header>
  );
}
