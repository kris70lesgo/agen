"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import Input from "@/components/ui/input";
import Radio from "@/components/ui/radio";
import type { BudgetRange, DietChatPayload } from "@/types/diet";

type HeightUnit = "cm" | "imperial";
type WeightUnit = "kg" | "lb";

const sexOptions = [
	{ id: "male", label: "Male" },
	{ id: "female", label: "Female" },
	{ id: "other", label: "Other" },
];

const activityOptions = [
	{ id: "sedentary", label: "Sedentary" },
	{ id: "light", label: "Light" },
	{ id: "moderate", label: "Moderate" },
	{ id: "active", label: "Active" },
	{ id: "very-active", label: "Very Active" },
];

const budgetOptions = [
	{ id: "no-limit", label: "No limit" },
	{ id: "lt-30", label: "< $30" },
	{ id: "30-60", label: "$30 - $60" },
	{ id: "60-90", label: "$60 - $90" },
	{ id: "gt-90", label: "$90+" },
];

const cuisineOptions = [
	"Any",
	"Asian",
	"Middle-Eastern",
	"Mediterranean",
	"Mexican-Latino",
	"African",
	"European",
	"American",
	"Indian",
	"Other",
];

const dietStyleOptions = [
	{ id: "none", label: "No preference" },
	{ id: "vegetarian", label: "Vegetarian" },
	{ id: "vegan", label: "Vegan" },
	{ id: "omnivorous", label: "Non-vegetarian (include meat/seafood)" },
];

const countries = [
	{ code: "US", name: "United States" },
	{ code: "CA", name: "Canada" },
	{ code: "GB", name: "United Kingdom" },
	{ code: "AU", name: "Australia" },
	{ code: "IN", name: "India" },
	{ code: "DE", name: "Germany" },
	{ code: "FR", name: "France" },
	{ code: "IT", name: "Italy" },
	{ code: "JP", name: "Japan" },
	{ code: "CN", name: "China" },
	{ code: "BR", name: "Brazil" },
	{ code: "ZA", name: "South Africa" },
	{ code: "MX", name: "Mexico" },
	{ code: "ES", name: "Spain" },
	{ code: "SG", name: "Singapore" },
	{ code: "AE", name: "United Arab Emirates" },
	{ code: "NG", name: "Nigeria" },
	{ code: "AR", name: "Argentina" },
	{ code: "KR", name: "South Korea" },
	{ code: "NL", name: "Netherlands" },
];

interface FormState {
	age: string;
	sex: string;
	heightUnit: HeightUnit;
	heightCm: string;
	heightFt: string;
	heightIn: string;
	weightUnit: WeightUnit;
	weightKg: string;
	weightLb: string;
	activityLevel: string;
	mainGoal: string;
	email: string;
	dislikedFoods: string;
	medicalNote: string;
	weeklyBudget: string;
	cuisines: string[];
	country: string;
	countryCode: string;
	dietStyle: string;
}

export default function DietPlanPage() {
	const router = useRouter();
	const [formData, setFormData] = useState<FormState>({
		age: "",
		sex: "",
		heightUnit: "cm",
		heightCm: "",
		heightFt: "",
		heightIn: "",
		weightUnit: "kg",
		weightKg: "",
		weightLb: "",
		activityLevel: "",
		mainGoal: "",
		email: "",
		dislikedFoods: "",
		medicalNote: "",
		weeklyBudget: "",
		cuisines: [],
		country: "",
		countryCode: "",
		dietStyle: "",
	});

	const [countryQuery, setCountryQuery] = useState("");
	const [isCountryOpen, setIsCountryOpen] = useState(false);

	const progressRatio = useMemo(() => {
		const ageComplete = (() => {
			if (!formData.age.trim()) return false;
			const ageNumber = Number(formData.age);
			return Number.isFinite(ageNumber) && ageNumber >= 12 && ageNumber <= 120;
		})();

		const heightComplete =
			formData.heightUnit === "cm"
				? Boolean(formData.heightCm.trim())
				: Boolean(formData.heightFt.trim()) && formData.heightIn.trim() !== "";

		const weightComplete =
			formData.weightUnit === "kg"
				? Boolean(formData.weightKg.trim())
				: Boolean(formData.weightLb.trim());

		const emailComplete = (() => {
			const trimmed = formData.email.trim();
			return trimmed.length > 3 && trimmed.includes("@");
		})();

		const mainGoalComplete = formData.mainGoal.trim().length > 0;
		const countryComplete = Boolean(formData.countryCode);

		const requiredChecklist = [
			ageComplete,
			Boolean(formData.sex),
			emailComplete,
			heightComplete,
			weightComplete,
			Boolean(formData.activityLevel),
			Boolean(formData.weeklyBudget),
			mainGoalComplete,
			countryComplete,
			Boolean(formData.dietStyle),
			formData.cuisines.length > 0,
		];

		const completed = requiredChecklist.filter(Boolean).length;
		return requiredChecklist.length
			? Math.min(1, Math.max(0, completed / requiredChecklist.length))
			: 0;
	}, [formData]);

	const filteredCountries = useMemo(() => {
		const query = countryQuery.toLowerCase();
		if (!query) return countries;
		return countries.filter(
			(country) =>
				country.name.toLowerCase().includes(query) ||
				country.code.toLowerCase().includes(query)
		);
	}, [countryQuery]);

	const updateField = (field: keyof FormState, value: string) => {
		setFormData((prev) => {
			if (prev[field] === value) {
				return prev;
			}
			return { ...prev, [field]: value };
		});
	};

	const toggleCuisine = (cuisine: string) => {
		setFormData((prev) => {
			const isSelected = prev.cuisines.includes(cuisine);
			if (isSelected) {
				return {
					...prev,
					cuisines: prev.cuisines.filter((item) => item !== cuisine),
				};
			}
			if (prev.cuisines.length >= 3) {
				return prev;
			}
			return { ...prev, cuisines: [...prev.cuisines, cuisine] };
		});
	};

	const handleCountrySelect = (country: { code: string; name: string }) => {
		updateField("country", country.name);
		updateField("countryCode", country.code);
		setCountryQuery(country.name);
		setIsCountryOpen(false);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const checks = [
			{ ok: progressRatio >= 1, message: "Please complete all required fields." },
			{ ok: Boolean(formData.countryCode), message: "Please select a country from the suggestions." },
		];

		const failing = checks.find((check) => !check.ok);
		if (failing) {
			if (!formData.countryCode) {
				setIsCountryOpen(true);
			}
			alert(failing.message);
			return;
		}
		const heightMetric =
			formData.heightUnit === "cm"
				? { unit: "cm" as const, value: parseFloat(formData.heightCm) || null }
				: {
					unit: "imperial" as const,
					feet: parseFloat(formData.heightFt) || null,
					inches: parseFloat(formData.heightIn) || null,
				};

		const weightMetric =
			formData.weightUnit === "kg"
				? { unit: "kg" as const, value: parseFloat(formData.weightKg) || null }
				: { unit: "lb" as const, value: parseFloat(formData.weightLb) || null };

		const payload: DietChatPayload = {
			form: { ...formData, cuisines: [...formData.cuisines] },
			height: heightMetric,
			weight: weightMetric,
			weeklyBudgetRange: mapBudgetToRange(formData.weeklyBudget),
			timestamp: new Date().toISOString(),
		};

		setIsCountryOpen(false);

		try {
			if (typeof window !== "undefined") {
				sessionStorage.setItem("diet-chat-profile", JSON.stringify(payload));
			}
		} catch (error) {
			console.error("Failed to store diet chat payload", error);
		}

		router.push("/dashboard/dietplan/aichat");
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#07071A] text-white">
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(63,84,201,0.5)_0%,_rgba(7,7,26,0.95)_50%,_rgba(0,0,12,1)_100%)]" />
			<div className="pointer-events-none absolute -right-40 top-1/3 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(255,90,180,0.25)_0%,_transparent_70%)]" />
			<main className="mx-auto w-full max-w-4xl px-6 py-16">
				<header className="mb-10 space-y-6">
					<div className="space-y-1">
						<p className="text-xs uppercase tracking-[0.3em] text-white/60">
							Step intake
						</p>
						<h1 className="text-2xl font-semibold text-white md:text-3xl">
							Tell us about yourself
						</h1>
						<p className="text-sm text-white/70">We would like to know more about you.</p>
					</div>
					<ProgressIndicator progress={progressRatio} />
				</header>

				<form onSubmit={handleSubmit} className="space-y-10">
					<section className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Input
							label="Age"
							type="number"
							min={12}
							max={120}
							required
							value={formData.age}
							onChange={(event) => updateField("age", event.target.value)}
						/>
						<Radio
							label="Sex"
							options={sexOptions}
							defaultOption={formData.sex}
							onValueChange={(value) => updateField("sex", value)}
							className="w-full"
						/>
						<div className="md:col-span-2">
							<Input
								label="E-mail"
								type="email"
								required
								value={formData.email}
								onChange={(event) => updateField("email", event.target.value)}
							/>
						</div>
					</section>

					<section className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<HeightField formData={formData} onChange={updateField} />
						<WeightField formData={formData} onChange={updateField} />
					</section>

					<section className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Radio
							label="Activity level"
							options={activityOptions}
							defaultOption={formData.activityLevel}
							onValueChange={(value) => updateField("activityLevel", value)}
							className="w-full"
						/>
						<Radio
							label="Weekly food budget"
							options={budgetOptions}
							defaultOption={formData.weeklyBudget}
							onValueChange={(value) => updateField("weeklyBudget", value)}
							className="w-full"
						/>
					</section>

					<section className="space-y-6">
						<TextAreaField
							label="Main goal"
							value={formData.mainGoal}
							onChange={(value) => updateField("mainGoal", value)}
							placeholder="e.g. lower LDL cholesterol, lose 5 kg, build muscle, vegetarian budget meals"
							maxLength={200}
							required
						/>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div>
								<Input
									label="Foods you hate"
									type="text"
									required={false}
									value={formData.dislikedFoods}
									onChange={(event) => updateField("dislikedFoods", event.target.value)}
									placeholder="Comma-separated list"
								/>
								<p className="mt-2 text-xs text-white/50">Optional</p>
							</div>
							<TextAreaField
								label="Any medical note"
								value={formData.medicalNote}
								onChange={(value) => updateField("medicalNote", value)}
								placeholder="e.g. diabetes, gluten allergy, breastfeeding"
								maxLength={120}
								required={false}
								compact
							/>
						</div>
					</section>

					<section className="space-y-6">
						<CuisineSelector selected={formData.cuisines} onToggle={toggleCuisine} />
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<CountryDropdown
								label="Country you live in"
								displayValue={countryQuery || formData.country}
								onQueryChange={(value) => {
									setCountryQuery(value);
									setIsCountryOpen(true);
									if (value !== formData.country && (formData.country !== "" || formData.countryCode !== "")) {
										updateField("country", "");
										updateField("countryCode", "");
									}
								}}
								onBlur={() => {
									setTimeout(() => setIsCountryOpen(false), 120);
								}}
								onFocus={() => setIsCountryOpen(true)}
								open={isCountryOpen}
								options={filteredCountries}
								onSelect={handleCountrySelect}
								required
							/>
							<Radio
								label="Diet style"
								options={dietStyleOptions}
								defaultOption={formData.dietStyle}
								onValueChange={(value) => updateField("dietStyle", value)}
								className="w-full"
							/>
						</div>
					</section>

					<div className="flex items-center justify-end pt-4">
						<button
							type="submit"
							disabled={progressRatio < 1}
							className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60"
						>
							Start chat
						</button>
					</div>
				</form>
			</main>
		</div>
	);
}

function mapBudgetToRange(budgetId: string): BudgetRange {
	switch (budgetId) {
		case "no-limit":
			return { min: null, max: null };
		case "lt-30":
			return { min: 0, max: 30 };
		case "30-60":
			return { min: 30, max: 60 };
		case "60-90":
			return { min: 60, max: 90 };
		case "gt-90":
			return { min: 90, max: null };
		default:
			return { min: null, max: null };
	}
}

function ProgressIndicator({ progress }: { progress: number }) {
	const clamped = Math.min(1, Math.max(0, progress));
	const stepTwoActive = clamped >= 1;

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
						1
					</div>
					<div>
						<p className="text-sm font-medium text-white">Profile</p>
						<p className="text-xs text-white/60">Tell us about you</p>
					</div>
				</div>
				<div className="relative h-px flex-1 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
					<div
						className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all"
						style={{ width: `${clamped * 100}%` }}
					/>
				</div>
				<div className={clsx("flex items-center gap-3", stepTwoActive ? "text-white" : "text-white/40")}
				>
					<div
						className={clsx(
							"flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition",
							stepTwoActive ? "bg-blue-500 text-white" : "border border-white/30"
						)}
					>
						2
					</div>
					<div>
						<p className="text-sm font-medium">Start chat</p>
						<p className="text-xs">{stepTwoActive ? "Ready" : "Next step"}</p>
					</div>
				</div>
			</div>
			<div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
				<div
					className="h-full rounded-full bg-blue-500 transition-all"
					style={{ width: `${clamped * 100}%` }}
				/>
			</div>
		</div>
	);
}

// Height and weight fields extracted for clarity
type FieldUpdater = (field: keyof FormState, value: string) => void;

function HeightField({ formData, onChange }: { formData: FormState; onChange: FieldUpdater }) {
	const switchUnit = (unit: HeightUnit) => onChange("heightUnit", unit);

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
			<div className="mb-3 flex items-center justify-between">
				<p className="text-sm font-medium text-white/80">Height</p>
				<div className="flex overflow-hidden rounded-full border border-white/10 bg-[#111323]">
					<button
						type="button"
						className={clsx(
							"px-3 py-1 text-xs font-medium",
							formData.heightUnit === "cm" ? "bg-blue-500 text-white" : "text-white/60"
						)}
						onClick={() => switchUnit("cm")}
					>
						cm
					</button>
					<button
						type="button"
						className={clsx(
							"px-3 py-1 text-xs font-medium",
							formData.heightUnit === "imperial" ? "bg-blue-500 text-white" : "text-white/60"
						)}
						onClick={() => switchUnit("imperial")}
					>
						ft / in
					</button>
				</div>
			</div>
			{formData.heightUnit === "cm" ? (
				<Input
					label="Height (cm)"
					type="number"
					min={50}
					max={250}
					required
					value={formData.heightCm}
					onChange={(event) => onChange("heightCm", event.target.value)}
				/>
			) : (
				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Height (ft)"
						type="number"
						min={3}
						max={8}
						required
						value={formData.heightFt}
						onChange={(event) => onChange("heightFt", event.target.value)}
					/>
					<Input
						label="Height (in)"
						type="number"
						min={0}
						max={11}
						required
						value={formData.heightIn}
						onChange={(event) => onChange("heightIn", event.target.value)}
					/>
				</div>
			)}
		</div>
	);
}

function WeightField({ formData, onChange }: { formData: FormState; onChange: FieldUpdater }) {
	const switchUnit = (unit: WeightUnit) => onChange("weightUnit", unit);

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
			<div className="mb-3 flex items-center justify-between">
				<p className="text-sm font-medium text-white/80">Weight</p>
				<div className="flex overflow-hidden rounded-full border border-white/10 bg-[#111323]">
					<button
						type="button"
						className={clsx(
							"px-3 py-1 text-xs font-medium",
							formData.weightUnit === "kg" ? "bg-blue-500 text-white" : "text-white/60"
						)}
						onClick={() => switchUnit("kg")}
					>
						kg
					</button>
					<button
						type="button"
						className={clsx(
							"px-3 py-1 text-xs font-medium",
							formData.weightUnit === "lb" ? "bg-blue-500 text-white" : "text-white/60"
						)}
						onClick={() => switchUnit("lb")}
					>
						lb
					</button>
				</div>
			</div>
			{formData.weightUnit === "kg" ? (
				<Input
					label="Weight (kg)"
					type="number"
					min={30}
					max={250}
					required
					value={formData.weightKg}
					onChange={(event) => onChange("weightKg", event.target.value)}
				/>
			) : (
				<Input
					label="Weight (lb)"
					type="number"
					min={66}
					max={550}
					required
					value={formData.weightLb}
					onChange={(event) => onChange("weightLb", event.target.value)}
				/>
			)}
		</div>
	);
}

const slugify = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

interface TextAreaFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	maxLength?: number;
	required?: boolean;
	compact?: boolean;
}

function TextAreaField({ label, value, onChange, placeholder, maxLength, required = false, compact = false }: TextAreaFieldProps) {
	const fieldId = `${slugify(label)}-textarea`;
	const remaining = typeof maxLength === "number" ? Math.max(maxLength - value.length, 0) : undefined;

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
			<div className="flex items-center justify-between gap-4">
				<label htmlFor={fieldId} className="text-sm font-medium text-white/80">
					{label}
					{required ? null : <span className="ml-2 text-xs text-white/50">Optional</span>}
				</label>
				{remaining !== undefined ? (
					<span className="text-xs text-white/50">{remaining} chars left</span>
				) : null}
			</div>
			<textarea
				id={fieldId}
				value={value}
				onChange={(event) => {
					const nextValue = maxLength ? event.target.value.slice(0, maxLength) : event.target.value;
					onChange(nextValue);
				}}
				required={required}
				maxLength={maxLength}
				placeholder={placeholder}
				className={clsx(
					"mt-3 w-full rounded-xl border border-white/10 bg-[#0c0f25] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-blue-500 focus:outline-none",
					compact ? "min-h-[120px]" : "min-h-[160px]"
				)}
			/>
		</div>
	);
}

interface CuisineSelectorProps {
	selected: string[];
	onToggle: (cuisine: string) => void;
}

function CuisineSelector({ selected, onToggle }: CuisineSelectorProps) {
	const maxSelected = selected.length >= 3;

	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
			<div className="flex items-center justify-between">
				<p className="text-sm font-medium text-white/80">Ethnicity / preferred cuisine</p>
				<span className="text-xs text-white/50">{selected.length}/3 selected</span>
			</div>
			<p className="mt-1 text-xs text-white/50">Choose up to three cuisines to bias your plan.</p>
			<div className="mt-3 flex flex-wrap gap-2">
				{cuisineOptions.map((option) => {
					const isSelected = selected.includes(option);
					const disabled = !isSelected && maxSelected;
					return (
						<button
							key={option}
							type="button"
							onClick={() => (!disabled ? onToggle(option) : undefined)}
							disabled={disabled}
							className={clsx(
								"rounded-full border px-4 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
								isSelected
									? "border-blue-400 bg-blue-500/20 text-blue-100"
									: "border-white/15 bg-white/5 text-white/70 hover:bg-white/10",
								disabled ? "cursor-not-allowed opacity-40" : ""
							)}
						>
							{option}
						</button>
					);
				})}
			</div>
		</div>
	);
}

interface CountryDropdownProps {
	label: string;
	displayValue: string;
	onQueryChange: (value: string) => void;
	onSelect: (country: { code: string; name: string }) => void;
	options: { code: string; name: string }[];
	open: boolean;
	onFocus?: () => void;
	onBlur?: () => void;
	required?: boolean;
}

function CountryDropdown({
	label,
	displayValue,
	onQueryChange,
	onSelect,
	options,
	open,
	onFocus,
	onBlur,
	required = false,
}: CountryDropdownProps) {
	const inputId = `${slugify(label)}-input`;
	const suggestionList = options.slice(0, 8);

	return (
		<div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
			<label htmlFor={inputId} className="text-sm font-medium text-white/80">
				{label}
			</label>
			<input
				id={inputId}
				type="text"
				value={displayValue}
				onChange={(event) => onQueryChange(event.target.value)}
				required={required}
				onFocus={onFocus}
				onBlur={onBlur}
				placeholder="Search by country or ISO code"
				className="mt-3 w-full rounded-xl border border-white/10 bg-[#0c0f25] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-blue-500 focus:outline-none"
			/>
			{open ? (
				<div className="absolute left-4 right-4 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-[#101228] py-2 shadow-2xl">
					{suggestionList.length > 0 ? (
						suggestionList.map((country) => (
							<button
								key={country.code}
								type="button"
								onMouseDown={(event) => event.preventDefault()}
								onClick={() => onSelect(country)}
								className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10"
							>
								<span>{country.name}</span>
								<span className="text-xs text-white/40">{country.code}</span>
							</button>
						))
					) : (
						<p className="px-3 py-2 text-sm text-white/50">No matches found</p>
					)}
				</div>
			) : null}
		</div>
	);
}

