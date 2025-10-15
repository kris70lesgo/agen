"use client";

import { ChatHandler, Message } from "@llamaindex/chat-ui";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import type { DietChatPayload } from "@/types/diet";

type Banner = { status: "success" | "error"; message: string };

type TextMessagePart = {
	type: "text";
	text: string;
	[key: string]: unknown;
};

type MarkdownCodeProps = React.ComponentPropsWithoutRef<"code"> & {
	inline?: boolean;
};

export interface DietChatSectionProps {
	profile: DietChatPayload;
}

export function DietChatSection({ profile }: DietChatSectionProps) {
	const handler = useDietChat(profile);
	const [draft, setDraft] = useState("");
	const [banner, setBanner] = useState<Banner | null>(null);
	const [emailInFlight, setEmailInFlight] = useState(false);
	const [downloadInFlight, setDownloadInFlight] = useState(false);
	const [lastAssistantMessage, setLastAssistantMessage] = useState<string | null>(
		null,
	);
	const [planMarkdown, setPlanMarkdown] = useState<string | null>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const isProcessing =
		handler.status === "streaming" || handler.status === "submitted";
	const canSend = draft.trim().length > 0 && !isProcessing;

	useEffect(() => {
		const container = listRef.current;
		if (!container) return;
		container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
	}, [handler.messages]);

	useEffect(() => {
		const latestAssistant = [...handler.messages]
			.reverse()
			.find(message => message.role !== "user");

		if (!latestAssistant) return;

		const text = latestAssistant.parts
			.filter(isTextPart)
			.map(part => part.text)
			.join("\n")
			.trim();

		if (text) setLastAssistantMessage(text);
	}, [handler.messages]);

	useEffect(() => {
		if (!banner) return;
		const timer = window.setTimeout(() => setBanner(null), 4800);
		return () => window.clearTimeout(timer);
	}, [banner]);

		useEffect(() => {
			const reversed = [...handler.messages].reverse();
			const latestPlan = reversed.find(message => {
				if (message.role === "user") return false;
				const text = message.parts
					.filter(isTextPart)
					.map(part => part.text)
					.join("\n")
					.trim();
				return text ? looksLikePlan(text) : false;
			});

			if (latestPlan) {
				const text = latestPlan.parts
					.filter(isTextPart)
					.map(part => part.text)
					.join("\n")
					.trim();
				setPlanMarkdown(text);
			} else if (handler.messages.length === 0) {
				setPlanMarkdown(null);
			}
		}, [handler.messages]);

		const planReady = useMemo(() => Boolean(planMarkdown), [planMarkdown]);

	const shouldTriggerEmail = useCallback(
		(message: string) => {
			const normalized = message.toLowerCase();
			if (!/mail|email|send/.test(normalized)) return false;
			if (!/plan|diet|meal/.test(normalized)) return false;
			return Boolean(profile.form.email);
		},
		[profile.form.email],
	);

	const emailPlan = useCallback(async () => {
		if (emailInFlight) return;

		if (!profile.form.email) {
			setBanner({
				status: "error",
				message: "No email on file. Update your intake form first.",
			});
			return;
		}

		if (!planReady || !planMarkdown) {
			setBanner({
				status: "error",
				message:
					"A full meal plan is not available yet. Ask the coach to finish it first.",
			});
			return;
		}

		setEmailInFlight(true);

		try {
			const response = await fetch("/api/diet-chat/email-plan", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					planMarkdown,
					to: profile.form.email,
					subject: `Your ${profile.form.mainGoal || "weekly diet"} plan`,
				}),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				const message =
					typeof payload === "object" && payload && "error" in payload
						? String((payload as { error?: string }).error ?? "Email failed")
						: "Email failed";
				setBanner({ status: "error", message });
				return;
			}

			setBanner({
				status: "success",
				message: `Sent the plan to ${profile.form.email}.`,
			});
		} catch (error) {
			console.error("Failed to email plan", error);
			setBanner({
				status: "error",
				message: "Unexpected error while sending the email.",
			});
		} finally {
			setEmailInFlight(false);
		}
	}, [emailInFlight, planMarkdown, planReady, profile.form.email, profile.form.mainGoal]);

	const downloadPlan = useCallback(async () => {
		if (downloadInFlight) return;

		if (!planReady || !planMarkdown) {
			setBanner({
				status: "error",
				message: "A finalized plan is required before generating a PDF.",
			});
			return;
		}

		setDownloadInFlight(true);

		try {
			const response = await fetch("/api/diet-chat/plan-pdf", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					planMarkdown,
					fileName: buildFileName(profile.form.mainGoal),
				}),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				const message =
					typeof payload === "object" && payload && "error" in payload
						? String((payload as { error?: string }).error ?? "PDF failed")
						: "PDF failed";
				setBanner({ status: "error", message });
				return;
			}

			const blob = await response.blob();
			const contentDisposition = response.headers.get("content-disposition");
			const suggested =
				extractFileName(contentDisposition) || buildFileName(profile.form.mainGoal);

			const url = window.URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = suggested;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			window.URL.revokeObjectURL(url);

			setBanner({
				status: "success",
				message: `Downloaded ${suggested}.`,
			});
		} catch (error) {
			console.error("Failed to download PDF", error);
			setBanner({
				status: "error",
				message: "Unexpected error while generating the PDF.",
			});
		} finally {
			setDownloadInFlight(false);
		}
	}, [downloadInFlight, planMarkdown, planReady, profile.form.mainGoal]);

	const sendDraft = useCallback(async () => {
		const trimmed = draft.trim();
		if (!trimmed || isProcessing) return;

		setDraft("");

		if (shouldTriggerEmail(trimmed)) {
			void emailPlan();
		}

		await handler.sendMessage({
			id: createMessageId(),
			role: "user",
			parts: [{ type: "text", text: trimmed }],
		});
	}, [draft, emailPlan, handler, isProcessing, shouldTriggerEmail]);

	const handleSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			void sendDraft();
		},
		[sendDraft],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				void sendDraft();
			}
		},
		[sendDraft],
	);

	const renderedMessages = useMemo(() => {
		return handler.messages.map(message => {
			const isAssistant = message.role !== "user";
			const text = message.parts
				.filter(isTextPart)
				.map(part => part.text)
				.join("\n")
				.trim();

			return (
				<div
					key={message.id}
					className={clsx("flex w-full", isAssistant ? "justify-start" : "justify-end")}
				>
					<div
						className={clsx(
							"relative max-w-full rounded-3xl px-5 py-3 text-sm leading-relaxed shadow-lg transition md:max-w-2xl",
							isAssistant
								? "bg-[#1A2038] text-white"
								: "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white",
						)}
					>
						{isAssistant ? (
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={markdownComponents}
								className="prose prose-invert max-w-none text-sm"
							>
								{text}
							</ReactMarkdown>
						) : (
							<div className="whitespace-pre-wrap break-words">{text}</div>
						)}
					</div>
				</div>
			);
		});
	}, [handler.messages]);

	const typingIndicator = isProcessing ? (
		<div className="flex w-full justify-start">
			<div className="flex items-center gap-2 rounded-3xl bg-[#1A2038] px-5 py-3 text-sm text-white/70">
				<span
					className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"
					aria-hidden="true"
				/>
				The coach is thinking...
			</div>
		</div>
	) : null;

	return (
		<div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#050816]/80 backdrop-blur-xl">
			{banner ? (
				<div
					className={clsx(
						"mx-6 mt-4 rounded-2xl border px-5 py-3 text-sm shadow",
						banner.status === "success"
							? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
							: "border-red-400/40 bg-red-400/10 text-red-200",
					)}
				>
					{banner.message}
				</div>
			) : null}

			<div ref={listRef} className="flex-1 overflow-y-auto">
				<div className="flex flex-col gap-4 p-6">
					{handler.messages.length === 0 ? (
						<div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/60">
							The coach is loading your intake details. You can ask a question now or wait for their follow-up.
						</div>
					) : (
						renderedMessages
					)}
					{typingIndicator}
				</div>
			</div>

			{planReady ? (
				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#050816]/90 px-4 py-3 text-xs text-white/70">
					<span>Plan ready! Email it to yourself or download the PDF.</span>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => void emailPlan()}
							disabled={emailInFlight || downloadInFlight}
							className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-2 text-xs font-medium text-white transition hover:border-[#3b82f6] hover:bg-[#1a2b56] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40"
						>
							{emailInFlight ? "Sending…" : "Email plan"}
						</button>
						<button
							type="button"
							onClick={() => void downloadPlan()}
							disabled={downloadInFlight || emailInFlight}
							className="inline-flex items-center gap-1 rounded-full bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1d4ed8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
						>
							{downloadInFlight ? "Generating…" : "Download PDF"}
						</button>
					</div>
				</div>
			) : null}

			<form onSubmit={handleSubmit} className="border-t border-white/10 bg-[#050816] p-4">
				<div className="flex items-end gap-3">
					<textarea
						value={draft}
						onChange={event => setDraft(event.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={emailInFlight ? "Emailing plan…" : "Send a message..."}
						disabled={emailInFlight}
						rows={1}
						className="h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-[#0A1024] px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/40 disabled:cursor-not-allowed disabled:opacity-70"
					/>
					<button
						type="submit"
						disabled={!canSend || emailInFlight}
						className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563eb] text-white transition hover:bg-[#1d4ed8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
						aria-label="Send message"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-5 w-5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M4.5 19.5 19.5 12 4.5 4.5 7.5 12l-3 7.5Z"
							/>
						</svg>
					</button>
				</div>
			</form>
		</div>
	);
}

type InternalStatus = "ready" | "submitted" | "streaming";

type InternalMessage = Message & { hidden?: boolean };

type SendTextOptions = { hidden?: boolean };

function useDietChat(profile: DietChatPayload): ChatHandler {
	const [messages, setMessages] = useState<Message[]>([]);
	const [status, setStatus] = useState<InternalStatus>("ready");
	const messagesRef = useRef<InternalMessage[]>([]);
	const inFlightRef = useRef(false);

	const reset = useCallback(() => {
		messagesRef.current = [];
		setMessages([]);
		setStatus("ready");
		inFlightRef.current = false;
	}, []);

	const appendMessage = useCallback((message: Message, hidden = false) => {
		const payload: InternalMessage = hidden
			? { ...message, hidden: true }
			: message;
		messagesRef.current = [...messagesRef.current, payload];
		setMessages(messagesRef.current.filter(entry => !entry.hidden) as Message[]);
	}, []);

	const sendText = useCallback(
		async (text: string, options?: SendTextOptions) => {
			const trimmed = text.trim();
			if (!trimmed) return;
			if (inFlightRef.current) return;

			const userMessage: Message = {
				id: createMessageId(),
				role: "user",
				parts: [{ type: "text", text: trimmed }],
			};

			appendMessage(userMessage, Boolean(options?.hidden));
			setStatus("submitted");
			inFlightRef.current = true;

			try {
				setStatus("streaming");
				const response = await fetch("/api/diet-chat", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						profile,
						messages: messagesRef.current.map(toApiMessage),
					}),
				});

				const payload = await response.json().catch(() => ({}));
				const replyRaw =
					typeof payload === "object" && payload !== null
						? (payload as { reply?: unknown }).reply
						: undefined;
				const assistantText =
					typeof replyRaw === "string" ? replyRaw.trim() : "";

				if (!response.ok) {
					appendMessage(
						{
							id: createMessageId(),
							role: "assistant",
							parts: [
								{
									type: "text",
									text:
										assistantText ||
										`The nutrition coach is unavailable (status ${response.status}). Please try again shortly.`,
								},
							],
						},
						Boolean(options?.hidden),
					);
					setStatus("ready");
					return;
				}

				const assistantMessage: Message = {
					id: createMessageId(),
					role: "assistant",
					parts: [
						{
							type: "text",
							text:
								assistantText ||
								"I was unable to generate a response. Please try asking again.",
						},
					],
				};

				appendMessage(assistantMessage, Boolean(options?.hidden));
				setStatus("ready");
			} catch (error) {
				console.error("Diet chat request failed", error);
				appendMessage(
					{
						id: createMessageId(),
						role: "assistant",
						parts: [
							{
								type: "text",
								text: "Something went wrong while reaching the nutrition coach. Please retry.",
							},
						],
					},
					Boolean(options?.hidden),
				);
				setStatus("ready");
			} finally {
				inFlightRef.current = false;
			}
		},
		[appendMessage, profile],
	);

	useEffect(() => {
		reset();
		const intro = buildProfileMessage(profile);
		void sendText(intro, { hidden: true });
	}, [profile, reset, sendText]);

	return {
		messages,
		status,
		sendMessage: async (message: Message) => {
			const text = message.parts
				.filter(isTextPart)
				.map(part => part.text)
				.join("\n")
				.trim();

			if (!text) return;
			await sendText(text);
		},
	};
}

function createMessageId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const markdownComponents: Components = {
	h1: props => <h1 className="mb-3 mt-4 text-xl font-semibold" {...props} />,
	h2: props => <h2 className="mb-3 mt-4 text-lg font-semibold" {...props} />,
	h3: props => <h3 className="mb-2 mt-4 text-base font-semibold" {...props} />,
	p: props => <p className="mb-3 leading-relaxed last:mb-0" {...props} />,
	ul: props => (
		<ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0" {...props} />
	),
	ol: props => (
		<ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0" {...props} />
	),
	li: props => <li className="leading-relaxed" {...props} />,
	strong: props => <strong className="font-semibold" {...props} />,
	em: props => <em className="italic" {...props} />,
	code: ({ inline, className, children, ...props }: MarkdownCodeProps) => {
		const base = "rounded bg-white/10 font-mono text-[0.8rem] text-emerald-200";
		if (inline) {
			return (
				<code className={clsx(base, "px-1.5 py-0.5", className)} {...props}>
					{children}
				</code>
			);
		}
		return (
			<pre className="mb-4 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4">
				<code className={clsx("block whitespace-pre-wrap", base, className)} {...props}>
					{children}
				</code>
			</pre>
		);
	},
	table: props => (
		<div className="mb-4 overflow-hidden overflow-x-auto rounded-xl border border-white/10">
			<table className="min-w-full text-sm" {...props} />
		</div>
	),
	thead: props => (
		<thead className="bg-white/5 text-left font-semibold" {...props} />
	),
	tbody: props => <tbody {...props} />,
	tr: props => <tr className="border-t border-white/10" {...props} />,
	th: props => (
		<th className="px-3 py-2 text-xs uppercase tracking-wide text-slate-200" {...props} />
	),
	td: props => (
		<td className="px-3 py-2 align-top text-sm" {...props} />
	),
	a: props => (
		<a
			className="text-emerald-300 underline decoration-dotted underline-offset-4 transition hover:text-emerald-200"
			{...props}
		/>
	),
};

function toApiMessage(message: Message) {
	return {
		role: message.role,
		content: message.parts
			.filter(isTextPart)
			.map(part => part.text)
			.join("\n"),
	};
}

function isTextPart(part: Message["parts"][number]): part is TextMessagePart {
	return part.type === "text";
}

function looksLikePlan(text: string) {
	const normalized = text.toLowerCase();
	if (normalized.length < 160) return false;

	const hasDay = /day\s*(?:\d+|one|two|three|four|five|six|seven)/i.test(text);
	const hasMeals = /(breakfast|lunch|dinner|snack|meal)/i.test(normalized);
	const hasCalories = /(calorie|kcal|protein|carb|fat)/i.test(normalized);
	const bulletLines = text
		.split("\n")
		.filter(line => /^[\s>*-]|\d+\./.test(line.trim())).length;

	return (hasDay && hasMeals) || (hasMeals && bulletLines >= 6) || (hasMeals && hasCalories);
}

function buildProfileMessage(profile: DietChatPayload) {
	const { form, height, weight, weeklyBudgetRange } = profile;

	const cuisineList = form.cuisines.length
		? form.cuisines.join(", ")
		: "None specified";

	const summaryLines = [
		`Age: ${form.age}`,
		`Sex: ${form.sex || "N/A"}`,
		`Height: ${
			height.unit === "cm"
				? `${height.value ?? "unknown"} cm`
				: `${height.feet ?? "??"} ft ${height.inches ?? 0} in`
		}`,
		`Weight: ${weight.value ?? "unknown"} ${weight.unit}`,
		`Activity level: ${form.activityLevel || "N/A"}`,
		`Goal: ${form.mainGoal}`,
		`Diet style: ${form.dietStyle || "No preference"}`,
		`Budget: ${describeBudget(weeklyBudgetRange)}`,
		`Cuisine bias: ${cuisineList}`,
		`Location: ${form.country || "N/A"} (${form.countryCode || "??"})`,
		form.dislikedFoods ? `Dislikes: ${form.dislikedFoods}` : null,
		form.medicalNote ? `Medical: ${form.medicalNote}` : null,
	]
		.filter(Boolean)
		.map(entry => `- ${entry}`)
		.join("\n");

	return [
		"You are the nutrition AI coach.",
		"Here is the latest profile you must use as primary context:",
		summaryLines,
		"Follow the workflow:",
		"1. Acknowledge the intake summary in friendly tone.",
		"2. Ask one clarifying question at a time until you can produce a confident 7-day diet plan (breakfast, lunch, dinner, snacks) obeying restrictions.",
		"3. After the questions are complete, deliver the plan in Markdown with per-day structure, calories estimates, and key nutrients.",
		"4. Offer to adjust the plan when the user replies.",
		"Remember to consider Spoonacular cuisine tags, Gemini reasoning, PDFBolt formatting, and Brevo delivery for next actions (describe what you will do, we will call those services separately).",
	].join("\n");
}

function describeBudget(range: DietChatPayload["weeklyBudgetRange"]) {
	if (range.min == null && range.max == null) return "No limit";
	if (range.min == null) return `< $${range.max}`;
	if (range.max == null) return `$${range.min}+`;
	return `$${range.min} - $${range.max}`;
}

function buildFileName(goal: string | null | undefined, extension = ".pdf") {
	const base = goal
		?.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return `${base || "diet-plan"}${extension}`;
}

function extractFileName(contentDisposition: string | null | undefined) {
	if (!contentDisposition) return null;
	const match = /filename="?([^";]+)"?/i.exec(contentDisposition);
	return match ? match[1] : null;
}
