import { NextRequest } from "next/server";

const SPOONACULAR_BASE_URL = "https://api.spoonacular.com/mealplanner/generate";

export async function POST(request: NextRequest) {
	const apiKey = process.env.SPOONACULAR_API_KEY;

	if (!apiKey) {
		return Response.json(
			{ error: "Missing SPOONACULAR_API_KEY. Please update your .env.local." },
			{ status: 500 }
		);
	}

	let body: {
		timeFrame?: "day" | "week";
		targetCalories?: number;
		diet?: string;
		exclude?: string;
	};

	try {
		body = await request.json();
	} catch (error) {
		console.error("Spoonacular meal-plan: invalid JSON body", error);
		return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
	}

	const timeFrame = body.timeFrame ?? "week";
	const params = new URLSearchParams({ apiKey, timeFrame });

	if (body.targetCalories) params.set("targetCalories", String(body.targetCalories));
	if (body.diet) params.set("diet", body.diet);
	if (body.exclude) params.set("exclude", body.exclude);

	const url = `${SPOONACULAR_BASE_URL}?${params.toString()}`;

	try {
		const response = await fetch(url, { method: "GET", cache: "no-store" });
		const result = await response.json();

		if (!response.ok) {
			const message = typeof result?.message === "string" ? result.message : "Spoonacular meal plan request failed.";
			return Response.json({ error: message }, { status: response.status });
		}

		return Response.json({ mealPlan: result });
	} catch (error) {
		console.error("Spoonacular meal-plan request failed", error);
		return Response.json(
			{ error: "Unexpected error while contacting Spoonacular." },
			{ status: 500 }
		);
	}
}
