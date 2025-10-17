"use client";

import { useState } from "react";
import { IconHome, IconUpload, IconX, IconLoader2 } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface VisionClientProps {
	session: {
		user?: {
			email?: string;
			name?: string;
		};
	} | null;
}

export default function VisionClient(_props: VisionClientProps) {
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [additionalDetails, setAdditionalDetails] = useState("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysis, setAnalysis] = useState("");

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewUrl(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setSelectedImage(null);
		setPreviewUrl("");
	};

	const handleAnalyze = async () => {
		if (!selectedImage) return;

		setIsAnalyzing(true);
		setAnalysis("");

		try {
			const formData = new FormData();
			formData.append("image", selectedImage);
			formData.append("details", additionalDetails);

			const response = await fetch("/api/gemini-vision", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to analyze image");
			}

			const data = await response.json();
			setAnalysis(data.analysis);
		} catch (error) {
			console.error("Error analyzing image:", error);
			setAnalysis("Error analyzing image. Please try again.");
		} finally {
			setIsAnalyzing(false);
		}
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#07071A] text-neutral-100">
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(90,50,200,0.65)_0%,_rgba(7,7,26,0.9)_45%,_rgba(2,2,10,1)_100%)]" />
			<div className="pointer-events-none absolute inset-y-0 -left-32 -z-10 h-[120%] w-[40%] rotate-12 bg-[radial-gradient(circle,_rgba(59,130,246,0.25)_0%,_transparent_60%)]" />

			{/* Header with Home Button */}
			<header className="sticky top-6 z-50 flex justify-between items-center px-6 py-4">
				<h1 className="text-3xl font-bold">Med Scan</h1>
				<a
					href="/dashboard"
					className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl transition-all hover:bg-white/20"
				>
					<IconHome size={20} />
					<span>Dashboard</span>
				</a>
			</header>

			{/* Main Content */}
			<main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-12">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Upload Section */}
					<div className="space-y-6">
						<div className="rounded-2xl border border-white/12 bg-white/5 p-6 backdrop-blur-xl">
							<h2 className="text-xl font-semibold mb-4">Upload Medical Image</h2>
							
							{/* Upload Box */}
							<div className="relative">
								{!previewUrl ? (
									<label
										htmlFor="image-upload"
										className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors bg-white/5"
									>
										<IconUpload size={48} className="text-white/50 mb-4" />
										<p className="text-white/70 text-sm">Click to upload X-ray, MRI, CT scan, etc.</p>
										<p className="text-white/50 text-xs mt-2">PNG, JPG up to 10MB</p>
										<input
											id="image-upload"
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											className="hidden"
										/>
									</label>
								) : (
									<div className="relative">
										<img
											src={previewUrl}
											alt="Preview"
											className="w-full h-64 object-contain rounded-xl bg-black/20"
										/>
										<button
											onClick={handleRemoveImage}
											className="absolute top-2 right-2 p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
										>
											<IconX size={20} />
										</button>
									</div>
								)}
							</div>

							{/* Additional Details Input */}
							<div className="mt-6">
								<label htmlFor="details" className="block text-sm font-medium text-white/80 mb-2">
									Additional Details (Optional)
								</label>
								<textarea
									id="details"
									value={additionalDetails}
									onChange={(e) => setAdditionalDetails(e.target.value)}
									placeholder="Provide any additional context about the patient, symptoms, or specific areas of concern..."
									rows={4}
									className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
								/>
							</div>

							{/* Analyze Button */}
							<button
								onClick={handleAnalyze}
								disabled={!selectedImage || isAnalyzing}
								className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isAnalyzing ? (
									<>
										<IconLoader2 size={20} className="animate-spin" />
										<span>Analyzing...</span>
									</>
								) : (
									<span>Analyze Image</span>
								)}
							</button>
						</div>
					</div>

					{/* Results Section */}
					<div className="space-y-6">
						<div className="rounded-2xl border border-white/12 bg-white/5 p-6 backdrop-blur-xl min-h-[500px]">
							<h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
							
							{!analysis && !isAnalyzing && (
								<div className="flex flex-col items-center justify-center h-[400px] text-center">
									<div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
										<IconUpload size={32} className="text-white/50" />
									</div>
									<p className="text-white/60">Upload and analyze a medical image to see results here</p>
								</div>
							)}

							{isAnalyzing && (
								<div className="flex flex-col items-center justify-center h-[400px]">
									<IconLoader2 size={48} className="animate-spin text-blue-500 mb-4" />
									<p className="text-white/70">Analyzing your medical image...</p>
									<p className="text-white/50 text-sm mt-2">This may take a few moments</p>
								</div>
						)}

						{analysis && !isAnalyzing && (
							<div className="prose prose-invert max-w-none">
								<div className="bg-white/5 rounded-xl p-6 border border-white/10">
									<h3 className="text-lg font-semibold text-white mb-4">AI Analysis:</h3>
									<div className="markdown-content text-white/90">
										<ReactMarkdown 
											remarkPlugins={[remarkGfm]}
											components={{
												h1: ({...props}) => <h1 className="text-2xl font-bold text-white mt-6 mb-4" {...props} />,
												h2: ({...props}) => <h2 className="text-xl font-bold text-white mt-5 mb-3" {...props} />,
												h3: ({...props}) => <h3 className="text-lg font-semibold text-white mt-4 mb-2" {...props} />,
												h4: ({...props}) => <h4 className="text-base font-semibold text-white mt-3 mb-2" {...props} />,
												p: ({...props}) => <p className="text-white/80 mb-3 leading-relaxed" {...props} />,
												ul: ({...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-white/80" {...props} />,
												ol: ({...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-white/80" {...props} />,
												li: ({...props}) => <li className="text-white/80 ml-4" {...props} />,
												strong: ({...props}) => <strong className="font-semibold text-white" {...props} />,
												em: ({...props}) => <em className="italic text-blue-300" {...props} />,
												code: ({...props}) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm text-blue-300" {...props} />,
												blockquote: ({...props}) => <blockquote className="border-l-4 border-blue-500/50 pl-4 italic text-white/70 my-3" {...props} />,
											}}
										>
											{analysis}
										</ReactMarkdown>
									</div>
								</div>
								<div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
									<p className="text-xs text-yellow-200/80">
										⚠️ <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for accurate diagnosis and treatment.
									</p>
								</div>
							</div>
						)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
