import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
	try {
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


		// Initialize OpenRouter with API key
		const openrouter = createOpenRouter({
			apiKey: process.env.OPENROUTER_API_KEY,
		});

		// Use Qwen2.5 VL 72B Instruct (free) - great for medical imaging
		// Alternative: "google/gemini-2.0-flash-exp:free"
		const { text } = await generateText({
			model: openrouter("qwen/qwen2.5-vl-72b-instruct:free"),
			messages: [
				{
					role: "user",
					content: [
						{ type: "text", text: prompt },
						{
							type: "image",
							image: `data:${mimeType};base64,${base64Image}`,
						},
					],
				},
			],
		});

		return NextResponse.json({ analysis: text });
	} catch (error: unknown) {
		console.error("Error analyzing image:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
		return NextResponse.json(
			{ error: "Failed to analyze image", details: errorMessage },
			{ status: 500 }
		);
	}
}
