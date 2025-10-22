import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons"
import { BellIcon, Share2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { AnimatedBeamMultipleOutputDemo } from "@/components/animated-beam-mulitple-ouputs"
import { AnimatedListDemo } from "@/components/animated-list-demo"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Marquee } from "@/components/ui/marquee"

const files = [
  {
    name: "health_data.json",
    body: "Client health metrics including age, weight, allergies, and dietary restrictions for personalized meal planning.",
  },
  {
    name: "nutrition_plan.pdf",
    body: "AI-generated personalized nutrition plan with weekly meal schedules and macro breakdowns.",
  },
  {
    name: "medical_scan.jpg",
    body: "Medical images analyzed by Med Scan AI for health insights and recommendations.",
  },
  {
    name: "diet_preferences.txt",
    body: "Client dietary preferences, food restrictions, and favorite cuisines for better meal suggestions.",
  },
  {
    name: "weekly_report.xlsx",
    body: "Comprehensive weekly health report with progress tracking and AI-powered recommendations.",
  },
]

const features = [
  {
    Icon: FileTextIcon,
    name: "Medical Image Analysis",
    description: "Upload and analyze medical images with AI-powered Med Scan.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-purple-500/20 bg-purple-900/10 hover:bg-purple-900/20",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium text-white">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs text-gray-300">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: BellIcon,
    name: "Real-time Notifications",
    description: "Get notified when meal plans are ready or clients update their data.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute top-4 right-2 h-[300px] w-full scale-75 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90" />
    ),
  },
  {
    Icon: Share2Icon,
    name: "AI Agent Integration",
    description: "Integrate diet planning and health analysis with our AI agents.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute top-4 right-2 h-[300px] border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105" />
    ),
  },
  {
    Icon: CalendarIcon,
    name: "Weekly Meal Planning",
    description: "Schedule and organize personalized meal plans with our calendar.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    background: (
      <Calendar
        mode="single"
        selected={new Date(2022, 4, 11, 0, 0, 0)}
        className="absolute top-10 right-0 origin-top scale-75 rounded-md border [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
      />
    ),
  },
]

export function BentoDemo() {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  )
}
