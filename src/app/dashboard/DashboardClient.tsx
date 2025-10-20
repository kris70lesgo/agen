"use client";

import { useState } from "react";
import {
	MobileNav,
	MobileNavHeader,
	MobileNavMenu,
	MobileNavToggle,
	NavBody,
	NavItems,
	Navbar,
	NavbarButton,
	NavbarLogo,
} from "@/components/ui/resizable-navbar";
import {
	CardBody,
	CardContainer,
	CardItem,
} from "@/components/ui/3d-card";

const navItems = [
	{ name: "Diet Plans", link: "/dashboard/dietplan" },
	{ name: "AI Chat", link: "/dashboard/dietplan/aichat" },
	{ name: "Settings", link: "/dashboard/settings" },
	{ name: "Pricing", link: "/dashboard/pricing" },
	{ name: "Home", link: "/" },
];

interface DashboardClientProps {
	session: {
		user?: {
			email?: string;
			name?: string;
			picture?: string;
		};
	} | null;
}

export default function DashboardClient({ session }: DashboardClientProps) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#07071A] text-neutral-100">
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(90,50,200,0.65)_0%,_rgba(7,7,26,0.9)_45%,_rgba(2,2,10,1)_100%)]" />
			<div className="pointer-events-none absolute inset-y-0 -left-32 -z-10 h-[120%] w-[40%] rotate-12 bg-[radial-gradient(circle,_rgba(255,95,162,0.25)_0%,_transparent_60%)]" />
			
			<header className="sticky top-6 z-50 flex justify-center px-4">
				<div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 shadow-[0_12px_40px_rgba(12,10,32,0.45)] backdrop-blur-2xl backdrop-saturate-150">
					<Navbar>
						<NavBody>
						<NavbarLogo />
						<NavItems items={navItems} />
						<div className="hidden items-center gap-3 md:flex">
							<span className="text-sm text-white/80">
								{session?.user?.name || session?.user?.email || 'User'}
							</span>
							<NavbarButton 
								href="/auth/logout"
								variant="secondary" 
								className="border-white/30 bg-white/10 text-white hover:bg-white/20"
							>
								Logout
							</NavbarButton>
						</div>
						</NavBody>

						<MobileNav>
							<MobileNavHeader>
								<NavbarLogo />
								<MobileNavToggle
									isOpen={isMobileMenuOpen}
									onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
								<div className="text-center text-sm text-white/80">
									{session?.user?.name || session?.user?.email || 'User'}
								</div>
								<NavbarButton
									href="/auth/logout"
									onClick={() => setIsMobileMenuOpen(false)}
										variant="primary"
										className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
									>
										Logout
									</NavbarButton>
								</div>
							</MobileNavMenu>
						</MobileNav>
					</Navbar>
				</div>
			</header>

			<main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-32">
				<section className="space-y-10">
					<div className="max-w-2xl space-y-4">
						<h1 className="text-4xl font-bold">Welcome to Your Dashboard</h1>
						<p className="text-lg text-white/70">
							Manage your diet plans and chat with your AI nutritionist.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<ThreeDCardDemo />
						<MedScanCard />
					</div>
				</section>
			</main>
		</div>
	);
}

function ThreeDCardDemo() {
	return (
		<CardContainer className="inter-var">
			<CardBody className="relative w-full max-w-lg rounded-xl border border-white/12 bg-gradient-to-br from-white/12 via-white/10 to-white/6 p-6 shadow-[0_18px_45px_rgba(8,8,24,0.55)] transition-transform duration-300 ease-out group/card backdrop-blur-xl hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(16,16,48,0.65)] group-hover/card:shadow-emerald-500/[0.2]">
				<CardItem
					translateZ="50"
					className="text-xl font-bold text-white"
				>
					Weekly Diet Agent
				</CardItem>
				<CardItem
					as="p"
					translateZ="60"
					className="mt-2 max-w-sm text-sm text-white/70"
				>
					Agent that plans and sends your diet plan weekly.
				</CardItem>
				<CardItem
					translateZ="120"
					className="mt-4 w-full transition-transform duration-300 group-hover/card:scale-[1.03]"
				>
					<img
						src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
						height="1000"
						width="1000"
						className="h-60 w-full rounded-xl object-cover opacity-90 transition duration-300 group-hover/card:opacity-100 group-hover/card:shadow-[0_20px_45px_rgba(38,194,129,0.25)]"
						alt="Floating landscape"
					/>
				</CardItem>
				<div className="mt-16 flex items-center justify-between">
					<CardItem
						translateZ={20}
						as="a"
						href="/dashboard/dietplan/aichat"
						className="rounded-xl px-4 py-2 text-xs font-normal text-white/80 hover:text-white"
					>
						Try now →
					</CardItem>
					<CardItem
						translateZ={20}
						as="a"
						href="/dashboard/dietplan"
						className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-200"
					>
						Get started
					</CardItem>
				</div>
			</CardBody>
		</CardContainer>
	);
}

function MedScanCard() {
	return (
		<CardContainer className="inter-var">
			<CardBody className="relative w-full max-w-lg rounded-xl border border-white/12 bg-gradient-to-br from-white/12 via-white/10 to-white/6 p-6 shadow-[0_18px_45px_rgba(8,8,24,0.55)] transition-transform duration-300 ease-out group/card backdrop-blur-xl hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(16,16,48,0.65)] group-hover/card:shadow-blue-500/[0.2]">
				<CardItem
					translateZ="50"
					className="text-xl font-bold text-white"
				>
					Med Scan
				</CardItem>
				<CardItem
					as="p"
					translateZ="60"
					className="mt-2 max-w-sm text-sm text-white/70"
				>
					AI-powered medical image analysis for X-rays, MRIs, CT scans, and more.
				</CardItem>
				<CardItem
					translateZ="120"
					className="mt-4 w-full transition-transform duration-300 group-hover/card:scale-[1.03]"
				>
					<img
						src="https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2560&auto=format&fit=crop"
						height="1000"
						width="1000"
						className="h-60 w-full rounded-xl object-cover opacity-90 transition duration-300 group-hover/card:opacity-100 group-hover/card:shadow-[0_20px_45px_rgba(59,130,246,0.25)]"
						alt="Medical scan"
					/>
				</CardItem>
				<div className="mt-16 flex items-center justify-between">
					<CardItem
						translateZ={20}
						as="a"
						href="/dashboard/vision"
						className="rounded-xl px-4 py-2 text-xs font-normal text-white/80 hover:text-white"
					>
						Analyze now →
					</CardItem>
					<CardItem
						translateZ={20}
						as="a"
						href="/dashboard/vision"
						className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-200"
					>
						Get started
					</CardItem>
				</div>
			</CardBody>
		</CardContainer>
	);
}
