import { NextRequest } from "next/server";

const DEFAULT_ENDPOINT = "https://api.pdfbolt.com/v1/pdf";

export async function POST(request: NextRequest) {
	let body: { html?: string; fileName?: string; metadata?: Record<string, unknown> };

	try {
		body = await request.json();
	} catch (error) {
		console.error("PDFBolt render route: invalid JSON", error);
		return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
	}

	const html = body.html?.trim();
	const fileName = body.fileName?.trim();

	if (!html) {
		return Response.json({ error: "Missing required 'html' markup" }, { status: 400 });
	}

	const apiKey = process.env.PDFBOLT_API_KEY?.trim();

	if (!apiKey) {
		return Response.json(
			{ error: "Missing PDFBOLT_API_KEY. Please update your environment configuration." },
			{ status: 500 }
		);
	}

	const endpoint = process.env.PDFBOLT_ENDPOINT?.trim() || DEFAULT_ENDPOINT;

	try {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": apiKey,
			},
			body: JSON.stringify({
				html,
				fileName,
				metadata: body.metadata ?? {},
			}),
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
				typeof parsed === "object" && parsed !== null && "error" in parsed
					? String((parsed as { error?: string }).error ?? "PDFBolt request failed")
					: "PDFBolt request failed";
			return Response.json({ error: message, details: parsed }, { status: response.status });
		}

		return Response.json({ pdf: parsed });
	} catch (error) {
		console.error("PDFBolt request failed", error);
		return Response.json(
			{ error: "Unexpected error while contacting PDFBolt." },
			{ status: 500 }
		);
	}
}
