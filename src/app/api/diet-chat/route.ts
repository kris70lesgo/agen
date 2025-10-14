import { NextRequest } from "next/server";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import type { DietChatPayload } from "@/types/diet";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "models/gemini-2.0-flash";

export async function POST(request: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return Response.json(
      {
        reply:
          "Server is missing GEMINI_API_KEY. Please add it to your .env file before chatting.",
      },
      { status: 500 }
    );
  }

  const google = createGoogleGenerativeAI({ apiKey: geminiKey });

  let body: {
    profile?: DietChatPayload;
    messages?: Array<{ role: string; content: string }>;
  };

  try {
    body = await request.json();
  } catch (error) {
    console.error("Failed to parse request body", error);
    return Response.json({ reply: "Invalid request payload." }, { status: 400 });
  }

  const profile = body.profile;
  const history = sanitizeMessages(body.messages ?? []);

  if (!profile) {
    return Response.json(
      { reply: "Missing profile data from intake form." },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(profile);

  try {
    const result = await generateText({
      model: google(GEMINI_MODEL),
      system: systemPrompt,
      messages: history,
    });
    const reply = result.text.trim();
    return Response.json({ reply });
  } catch (error) {
    console.error("Gemini call failed", error);
    return Response.json(
      {
        reply:
          "I ran into an issue while talking with the planning model. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}

function sanitizeMessages(messages: Array<{ role: string; content: string }>) {
  return messages
    .filter(message =>
      message && typeof message.role === "string" && typeof message.content === "string"
    )
    .map(message => ({
      role: normalizeRole(message.role),
      content: message.content.replace(/\s+$/u, ""),
    }));
}

function normalizeRole(role: string): "user" | "assistant" | "system" {
  if (role === "assistant" || role === "system") return role;
  return "user";
}

function buildSystemPrompt(profile: DietChatPayload) {
  const { form, height, weight, weeklyBudgetRange } = profile;

  const budget = describeBudget(weeklyBudgetRange);

  const summaryLines = [
    `Age: ${form.age}`,
    `Sex: ${form.sex || "Not provided"}`,
    `Height input: ${formatHeight(height)}`,
    `Weight input: ${formatWeight(weight)}`,
    `Activity level: ${form.activityLevel || "Not provided"}`,
    `Primary goal: ${form.mainGoal}`,
    `Diet style: ${form.dietStyle || "No preference"}`,
    `Cuisine focus: ${form.cuisines.length ? form.cuisines.join(", ") : "Open"}`,
    `Weekly budget band: ${budget}`,
    `Country: ${form.country || "Unknown"} (${form.countryCode || "??"})`,
    form.dislikedFoods ? `Disliked foods: ${form.dislikedFoods}` : null,
    form.medicalNote ? `Medical notes: ${form.medicalNote}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const spoonacularTag = form.cuisines.length ? form.cuisines.join(", ") : "no tag";
  const integrationLine = `Use these integrations conceptually: Gemini for reasoning, Spoonacular for cuisine + diet tags (${form.dietStyle || "none"}, ${spoonacularTag}), PDFBolt to render the final plan to PDF, Brevo to send the PDF via email (${form.email}).`;

  return [
    "You are AssHelp, a registered dietitian AI coach.",
    "You will interview the user, collect missing info, and craft a detailed seven day meal plan (breakfast, lunch, dinner, snacks).",
    "Follow this decision loop:",
    "- Ask exactly one clarifying question at a time until you have enough detail for a precise plan.",
    "- After each user answer, re-evaluate remaining gaps.",
    "- Once confident, output the final plan in Markdown with sections per day and per meal, include calories, macros, prep tips, and grocery notes.",
    "- Afterwards, invite the user to request modifications (budget change, food swap, allergies).",
    integrationLine,
    "Never mention lacking access; instead describe what will happen next (e.g. 'I'll queue a Spoonacular call').",
    "Base context from form:",
    summaryLines,
    "Ensure recommendations respect age, sex, budget, disliked foods, and medical notes.",
    "Calorie targets should align with typical TDEE for the profile and stated goal.",
  ].join("\n\n");
}

function describeBudget(range: DietChatPayload["weeklyBudgetRange"]) {
  if (range.min == null && range.max == null) return "No limit";
  if (range.min == null) return `< $${range.max}`;
  if (range.max == null) return `$${range.min}+`;
  return `$${range.min} - $${range.max}`;
}

function formatHeight(height: DietChatPayload["height"]) {
  if (height.unit === "cm") {
    return `${height.value ?? "?"} cm`;
  }
  return `${height.feet ?? "?"} ft ${height.inches ?? 0} in`;
}

function formatWeight(weight: DietChatPayload["weight"]) {
  return `${weight.value ?? "?"} ${weight.unit}`;
}
