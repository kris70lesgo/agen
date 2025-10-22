import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { auth0 } from "@/lib/auth0";
import { withAuthorization } from "@/middleware/authorization";
import { permissions } from "@/lib/auth0-fga";
import { TokenVault } from "@/lib/token-vault";

// Fallback models in order of preference
const VISION_MODELS = [
	"google/gemini-2.0-flash-exp:free",  // Primary: Best for medical imaging
	"anthropic/claude-3.5-sonnet",        // Fallback 1: Excellent vision capabilities
	"meta-llama/llama-2-7b-chat:free",    // Fallback 2: Open source alternative
];

interface AnalysisResult {
	text: string;
	model: string;
	attempt: number;
}

async function analyzeWithModel(
	openrouter: ReturnType<typeof createOpenRouter>,
	model: string,
	imageData: string,
	mimeType: string,
	prompt: string,
	attempt: number
): Promise<AnalysisResult> {
	try {
		console.log(`[Vision API] Attempt ${attempt}: Trying model ${model}`);
		
		const { text } = await generateText({
			model: openrouter(model),
			messages: [
				{
					role: "user",
					content: [
						{ type: "text", text: prompt },
						{
							type: "image",
							image: `data:${mimeType};base64,${imageData}`,
						},
					],
				},
			],
			temperature: 0.3,
		});

		console.log(`[Vision API] Success with model ${model} on attempt ${attempt}`);
		return { text, model, attempt };
	} catch (error) {
		console.error(`[Vision API] Failed with model ${model}:`, error instanceof Error ? error.message : String(error));
		throw error;
	}
}

export async function POST(req: NextRequest) {
	try {
		// 1. Authenticate user
		const session = await auth0.getSession();
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized: Please log in" },
				{ status: 401 }
			);
		}

		const userId = session.user.sub;

		// 2. Check permission to use vision API
		const authError = await withAuthorization(permissions.USE_VISION_API);
		if (authError) return authError;

		// 3. Get API token from Token Vault
		const apiKey = await TokenVault.getToken(userId, 'openrouter');

		if (!apiKey) {
			return NextResponse.json(
				{ 
					error: "API key not configured",
					message: "Please contact administrator to set up API access"
				},
				{ status: 500 }
			);
		}

		// 4. Track token usage
		await TokenVault.trackTokenUsage(userId, 'openrouter');

		const formData = await req.formData();
		const image = formData.get("image") as File;
		const details = formData.get("details") as string;

		if (!image) {
			return NextResponse.json(
				{ error: "No image provided" },
				{ status: 400 }
			);
		}

		// Convert image to base64
		const bytes = await image.arrayBuffer();
		const buffer = Buffer.from(bytes);
		const base64Image = buffer.toString("base64");

		// Get the mime type
		const mimeType = image.type;

		// Create the prompt for medical image analysis
		const prompt = `You are a medical imaging AI assistant. Analyze the provided medical image (X-ray, MRI, CT scan, etc.) and provide a well-formatted markdown response with the following structure:

## Analysis of the Medical Image

### 1. Type of Medical Imaging
Identify the type of medical imaging (X-ray, MRI, CT, etc.)

### 2. Body Part or Area Shown
Describe what body part or area is shown in the image.

### 3. Observable Abnormalities, Findings, or Noteworthy Features
List any observable abnormalities, findings, or noteworthy features. Use bullet points for clarity.

### 4. Detailed Analysis
Provide a brief, accurate analysis based ONLY on what is visible in the image. Use clear, professional medical terminology but also explain in layman's terms.

### 5. Recommendations
Highlight any areas that may require attention from a medical professional.

${details ? `\n**Additional context provided by user:** ${details}\n` : ""}

**IMPORTANT GUIDELINES:**
- Be factual and accurate
- DO NOT make assumptions or diagnoses beyond what is clearly visible
- DO NOT provide definitive diagnoses
- Format your response using proper markdown (headers, bullet points, bold text, etc.)
- Recommend consulting a healthcare professional for proper diagnosis
- Only describe what is actually visible in the image

Please provide your analysis in markdown format:`;

		// Initialize OpenRouter with API key from Token Vault
		const openrouter = createOpenRouter({
			apiKey: apiKey,
		});

		// Try each model in fallback order
		let lastError: Error | null = null;
		let result: AnalysisResult | null = null;

		for (let i = 0; i < VISION_MODELS.length; i++) {
			const model = VISION_MODELS[i];
			try {
				result = await analyzeWithModel(
					openrouter,
					model,
					base64Image,
					mimeType,
					prompt,
					i + 1
				);
				break; // Success! Exit the loop
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				console.error(`[Vision API] Model ${model} failed, trying next...`);
				
				// Continue to next model if this one fails
				if (i < VISION_MODELS.length - 1) {
					continue;
				}
			}
		}

		// If all models failed, return error
		if (!result) {
			console.error(`[Vision API] All ${VISION_MODELS.length} models failed for user ${userId}`);
			return NextResponse.json(
				{ 
					error: "Failed to analyze image with all available models",
					details: lastError?.message || "Unknown error",
					modelsAttempted: VISION_MODELS.length
				},
				{ status: 500 }
			);
		}

		console.log(`[Vision API] Analysis completed for user ${userId} using model: ${result.model}`);

		return NextResponse.json({ 
			analysis: result.text,
			model: result.model,
			attempt: result.attempt
		});
	} catch (error: unknown) {
		console.error("Error analyzing image:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		return NextResponse.json(
			{ error: "Failed to analyze image", details: errorMessage },
			{ status: 500 }
		);
	}
}
