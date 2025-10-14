import { NextRequest } from "next/server";

const BREVO_ENDPOINT = process.env.BREVO_ENDPOINT?.trim() || "https://api.brevo.com/v3/smtp/email";

interface BrevoRequestBody {
	to?: string | string[];
	subject?: string;
	html?: string;
	text?: string;
	senderEmail?: string;
	senderName?: string;
}

export async function POST(request: NextRequest) {
	let body: BrevoRequestBody;

	try {
		body = await request.json();
	} catch (error) {
		console.error("Brevo send route: invalid JSON", error);
		return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
	}

	const recipientsRaw = body.to;
	const recipients = Array.isArray(recipientsRaw)
		? recipientsRaw.map((value) => value?.trim()).filter(Boolean)
		: recipientsRaw
			? [recipientsRaw.trim()].filter(Boolean)
			: [];

	const senderEmail = body.senderEmail?.trim();
	const senderName = body.senderName?.trim();
	const subject = body.subject?.trim() || "Your weekly diet plan";
	const html = body.html?.trim();
	const text = body.text?.trim();

	if (!recipients.length || !senderEmail || !html) {
		return Response.json(
			{ error: "Missing required 'to', 'senderEmail', or 'html' fields." },
			{ status: 400 }
		);
	}

	const apiKey = process.env.BREVO_API_KEY?.trim();

	if (!apiKey) {
		return Response.json(
			{ error: "Missing BREVO_API_KEY. Please update your environment configuration." },
			{ status: 500 }
		);
	}

	const payload = {
		sender: { email: senderEmail, name: senderName },
		to: recipients.map((email) => ({ email })),
		subject,
		htmlContent: html,
		textContent: text,
	};

	try {
		const response = await fetch(BREVO_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"api-key": apiKey,
				Accept: "application/json",
			},
			body: JSON.stringify(payload),
		});

		const resultText = await response.text();
		let parsed: unknown;
		try {
			parsed = JSON.parse(resultText);
		} catch {
			parsed = resultText;
		}

		if (!response.ok) {
			const message =
				typeof parsed === "object" && parsed !== null && "message" in parsed
					? String((parsed as { message?: string }).message ?? "Brevo request failed")
					: "Brevo request failed";
			return Response.json({ error: message, details: parsed }, { status: response.status });
		}

		return Response.json({ message: parsed });
	} catch (error) {
		console.error("Brevo request failed", error);
		return Response.json(
			{ error: "Unexpected error while contacting Brevo." },
			{ status: 500 }
		);
	}
}
