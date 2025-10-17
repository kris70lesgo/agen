import { marked } from "marked";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

const PAGE_WIDTH = 612; // 8.5in * 72
const PAGE_HEIGHT = 792; // 11in * 72
const LEFT_MARGIN = 64;
const RIGHT_MARGIN = 64;
const TOP_MARGIN = 72;
const BOTTOM_MARGIN = 72;
const CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;

const DEFAULT_FILENAME = "diet-plan.pdf";

interface RequestBody {
	planMarkdown?: unknown;
	fileName?: unknown;
}

type Instruction =
	| { type: "heading"; text: string; depth: number }
	| { type: "paragraph"; text: string }
	| { type: "listItem"; text: string; ordered: boolean; index: number }
	| { type: "code"; text: string };

export async function POST(request: Request) {
	let payload: RequestBody;

	try {
		payload = (await request.json()) as RequestBody;
	} catch (error) {
		console.error("plan-pdf: invalid JSON", error);
		return NextResponse.json(
			{ error: "Invalid request payload" },
			{ status: 400 },
		);
	}

	const planMarkdown =
		typeof payload.planMarkdown === "string" ? payload.planMarkdown.trim() : "";

	if (!planMarkdown) {
		return NextResponse.json(
			{ error: "planMarkdown is required" },
			{ status: 400 },
		);
	}

	const requestedFileName =
		typeof payload.fileName === "string" && payload.fileName.trim().length > 0
			? sanitizeFilename(payload.fileName)
			: DEFAULT_FILENAME;

	try {
		const instructions = markdownToInstructions(planMarkdown);
		const pdfBytes = await buildPdf(instructions, requestedFileName);

		return new NextResponse(Buffer.from(pdfBytes), {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${requestedFileName}"`,
			},
		});
	} catch (error) {
		console.error("plan-pdf: failed to generate PDF", error);
		return NextResponse.json(
			{ error: "Failed to generate PDF" },
			{ status: 500 },
		);
	}
}

function sanitizeFilename(candidate: string) {
	return candidate.replace(/[\\/:*?"<>|]/g, "").trim() || DEFAULT_FILENAME;
}


function markdownToInstructions(markdown: string): Instruction[] {
	const lexer = marked.lexer(markdown, { pedantic: false, gfm: true });
	const instructions: Instruction[] = [];

	for (const token of lexer) {
		switch (token.type) {
			case "heading":
				instructions.push({
					type: "heading",
					text: stripMarkdown(token.text ?? ""),
					depth: Math.min(token.depth ?? 1, 4),
				});
				break;
			case "paragraph":
				instructions.push({
					type: "paragraph",
					text: stripMarkdown(token.text ?? ""),
				});
				break;
			case "code":
				instructions.push({
					type: "code",
					text: token.text ?? "",
				});
				break;
			case "list": {
				const ordered = Boolean(token.ordered);
				const start = typeof token.start === "number" ? token.start : 1;
				let index = start;

				for (const item of token.items ?? []) {
					instructions.push({
						type: "listItem",
						text: stripMarkdown(item.text ?? ""),
						ordered,
						index,
					});
					index += 1;
				}

				break;
			}
			default:
				break;
		}
	}

	return instructions;
}

function stripMarkdown(input: string) {
	return input
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/\*([^*]+)\*/g, "$1")
		.replace(/_([^_]+)_/g, "$1")
		.replace(/~~([^~]+)~~/g, "$1")
		.replace(/\!\[([^\]]*)\]\(([^)]+)\)/g, "$1 ($2)")
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
		.replace(/>\s?/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

async function buildPdf(instructions: Instruction[], title: string) {
	const pdfDoc = await PDFDocument.create();
	const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

	let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	let cursorY = PAGE_HEIGHT - TOP_MARGIN;

	const ensureSpace = (height: number) => {
		if (cursorY - height <= BOTTOM_MARGIN) {
			page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
			cursorY = PAGE_HEIGHT - TOP_MARGIN;
		}
	};

	const drawLines = (
		lines: string[],
		options: {
			font: import("pdf-lib").PDFFont;
			fontSize: number;
			lineGap?: number;
			x?: number;
			color?: ReturnType<typeof rgb>;
		},
	) => {
		const {
			font,
			fontSize,
			lineGap = 6,
			x = LEFT_MARGIN,
			color = rgb(0.16, 0.18, 0.24),
		} = options;
		for (const line of lines) {
			ensureSpace(fontSize + lineGap);
			page.drawText(line, {
				x,
				y: cursorY - fontSize,
				size: fontSize,
				font,
				color,
			});
			cursorY -= fontSize + lineGap;
		}
	};

	// Document title header
	const header = title.replace(/\.pdf$/i, "");
	const headerSize = 22;
	page.drawText(header, {
		x: LEFT_MARGIN,
		y: cursorY - headerSize,
		size: headerSize,
		font: fontBold,
		color: rgb(0.09, 0.48, 0.36),
	});
	cursorY -= headerSize + 14;

	for (const instruction of instructions) {
		switch (instruction.type) {
			case "heading": {
				const size = instruction.depth === 1 ? 18 : instruction.depth === 2 ? 16 : 14;
				const lines = wrapText(instruction.text, fontBold, size);
				drawLines(lines, { font: fontBold, fontSize: size });
				cursorY -= 4;
				break;
			}
			case "paragraph": {
				if (!instruction.text) {
					cursorY -= 8;
					break;
				}
				const lines = wrapText(instruction.text, fontRegular, 12);
				drawLines(lines, { font: fontRegular, fontSize: 12 });
				cursorY -= 4;
				break;
			}
			case "listItem": {
				const fontSize = 12;
				const label = instruction.ordered
					? `${instruction.index}.`
					: "•";
				const labelWidth = fontBold.widthOfTextAtSize(label, fontSize) + 6;
				const wrapped = wrapText(
					instruction.text,
					fontRegular,
					fontSize,
					CONTENT_WIDTH - labelWidth,
				);

				wrapped.forEach((line, lineIndex) => {
					ensureSpace(fontSize + 4);
					if (lineIndex === 0) {
						page.drawText(label, {
							x: LEFT_MARGIN,
							y: cursorY - fontSize,
							size: fontSize,
							font: fontBold,
							color: rgb(0.13, 0.15, 0.22),
						});
					}

					page.drawText(line, {
						x: LEFT_MARGIN + labelWidth,
						y: cursorY - fontSize,
						size: fontSize,
						font: fontRegular,
						color: rgb(0.16, 0.18, 0.24),
					});
					cursorY -= fontSize + 4;
				});

				cursorY -= 2;
				break;
			}
			case "code": {
				const backgroundHeight = estimateCodeBlockHeight(instruction.text, fontMono, 11);
				ensureSpace(backgroundHeight + 14);
				page.drawRectangle({
					x: LEFT_MARGIN - 8,
					y: cursorY - backgroundHeight - 8,
					width: CONTENT_WIDTH + 16,
					height: backgroundHeight + 12,
					color: rgb(0.95, 0.97, 1),
					opacity: 0.9,
				});

				const lines = wrapCodeBlock(instruction.text, fontMono, 11);
				let codeCursor = cursorY - 14;
				for (const line of lines) {
					page.drawText(line, {
						x: LEFT_MARGIN,
						y: codeCursor - 11,
						size: 11,
						font: fontMono,
						color: rgb(0.13, 0.15, 0.22),
					});
					codeCursor -= 14;
				}
				cursorY = codeCursor - 6;
				break;
			}
			default:
				break;
		}
	}

	const pdfBytes = await pdfDoc.save();
	return pdfBytes;
}

function wrapText(
	text: string,
	font: import("pdf-lib").PDFFont,
	fontSize: number,
	maxWidth: number = CONTENT_WIDTH,
) {
	const sanitized = text.replace(/\s+/g, " ").trim();
	if (!sanitized) return [""];

	const words = sanitized.split(" ");
	const lines: string[] = [];
	let current = "";

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;
		const width = font.widthOfTextAtSize(candidate, fontSize);
		if (width <= maxWidth) {
			current = candidate;
		} else {
			if (current) lines.push(current);
			if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
				const split = wrapLongWord(word, font, fontSize, maxWidth);
				lines.push(...split.slice(0, -1));
				current = split.at(-1) ?? "";
			} else {
				current = word;
			}
		}
	}

	if (current) lines.push(current);
	return lines;
}

function wrapCodeBlock(
	code: string,
	font: import("pdf-lib").PDFFont,
	fontSize: number,
	maxWidth: number = CONTENT_WIDTH,
) {
	const lines: string[] = [];
	const rawLines = code.replace(/\r\n/g, "\n").split("\n");

	for (const raw of rawLines) {
		if (!raw) {
			lines.push("");
			continue;
		}

		if (font.widthOfTextAtSize(raw, fontSize) <= maxWidth) {
			lines.push(raw);
			continue;
		}

		const segments = wrapLongWord(raw, font, fontSize, maxWidth);
		lines.push(...segments);
	}

	return lines;
}

function wrapLongWord(
	word: string,
	font: import("pdf-lib").PDFFont,
	fontSize: number,
	maxWidth: number,
) {
	const chars = word.split("");
	let buffer = "";
	const lines: string[] = [];

	for (const char of chars) {
		const candidate = buffer + char;
		const width = font.widthOfTextAtSize(candidate, fontSize);
		if (width <= maxWidth) {
			buffer = candidate;
		} else {
			if (buffer) lines.push(buffer);
			buffer = char;
		}
	}

	if (buffer) lines.push(buffer);
	return lines;
}

function estimateCodeBlockHeight(
	code: string,
	font: import("pdf-lib").PDFFont,
	fontSize: number,
) {
	const lines = wrapCodeBlock(code, font, fontSize);
	const lineHeight = fontSize + 3;
	return lines.length * lineHeight;
}
