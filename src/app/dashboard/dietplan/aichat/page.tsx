"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { DietChatSection } from "@/components/chat";
import type { DietChatPayload } from "@/types/diet";

const STORAGE_KEY = "diet-chat-profile";

export default function DietPlanAiChatPage() {
	const router = useRouter();
	const [profile, setProfile] = useState<DietChatPayload | null>(null);
	const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		if (typeof window === "undefined") return;

		try {
			const raw = sessionStorage.getItem(STORAGE_KEY);
			if (!raw) {
				setErrorMessage("We could not find your intake submission. Please fill the form again.");
				setStatus("error");
				return;
			}

			const parsed = JSON.parse(raw) as DietChatPayload | null;
			if (!parsed || typeof parsed !== "object") {
				throw new Error("Malformed diet chat payload");
			}

			setProfile(parsed);
			setStatus("ready");
		} catch (error) {
			console.error("Failed to restore diet chat payload", error);
			setErrorMessage("We hit a snag while loading your profile. Please refill the form.");
			setStatus("error");
		}
	}, []);

	useEffect(() => {
		if (status !== "error") return;
		const timer = window.setTimeout(() => {
			router.replace("/dashboard/dietplan");
		}, 2800);
		return () => window.clearTimeout(timer);
	}, [status, router]);

	const handleRestart = useCallback(() => {
		if (typeof window !== "undefined") {
			sessionStorage.removeItem(STORAGE_KEY);
		}
		router.push("/dashboard/dietplan");
	}, [router]);

	const pageBody = useMemo(() => {
		if (status === "loading") {
			return (
				<div className="flex h-full flex-col items-center justify-center gap-4 text-white/80">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" aria-hidden="true" />
					<p className="text-sm">Connecting you with your nutrition coach…</p>
				</div>
			);
		}

		if (status === "error") {
			return (
				<div className="flex h-full flex-col items-center justify-center gap-6 text-center text-white">
					<p className="text-sm text-white/80">{errorMessage}</p>
					<button
						type="button"
						onClick={handleRestart}
						className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
					>
						Return to intake form
					</button>
				</div>
			);
		}

		if (!profile) {
			return null;
		}

		return (
			<div className="flex h-full flex-col gap-6">
				<header className="space-y-2 text-white">
					<p className="text-xs uppercase tracking-[0.3em] text-white/60">Step two</p>
					<h1 className="text-2xl font-semibold">Personalized weekly coach</h1>
					<p className="text-sm text-white/70">
						Your intake summary has been shared. Chat with the AI coach to refine your plan.
					</p>
				</header>
				<div className="flex flex-1 flex-col">
					<DietChatSection profile={profile} />
				</div>
				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleRestart}
						className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
					>
						Restart intake
					</button>
				</div>
			</div>
		);
	}, [status, errorMessage, handleRestart, profile]);

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#07071A] text-white">
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(63,84,201,0.45)_0%,_rgba(7,7,26,0.95)_50%,_rgba(0,0,12,1)_100%)]" />
			<div className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(255,90,180,0.25)_0%,_transparent_70%)]" />
			<main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16">
				{pageBody}
			</main>
		</div>
	);
}