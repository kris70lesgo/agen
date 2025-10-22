import { auth0 } from "@/lib/auth0";
import './globals.css';
import React from "react";
import { MainNavbar } from "@/components/MainNavbar";
import CardSwap, { Card } from '@/components/CardSwap';
import { Marquee } from "@/components/ui/marquee";
import { BentoDemo } from "@/components/Bentogrid";
import { cn } from "@/lib/utils";
import MainContent from "@/app/MainContentClient";

export default async function Home() {
  const session = await auth0.getSession();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05050F] text-white">
      {/* Distant violet-blue background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top,_rgba(90,50,230,0.4)_0%,_rgba(6,6,18,0.9)_55%,_rgba(3,3,11,1)_100%)]" />
      {/* Dim cyan aura — very subtle now */}
      <div className="pointer-events-none absolute inset-x-0 top-[35%] -z-20 h-[40rem] rounded-full bg-[radial-gradient(circle,_rgba(120,220,255,0.12)_0%,_rgba(5,5,15,0)_70%)] blur-[140px]" />

      {/* Navbar */}
      <MainNavbar session={session} />

      {/* MAIN SECTION */}
      <MainContent session={session} />

      {/* CARD SWAP SECTION */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            How It Works
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side text */}
            <div className="space-y-6">
              <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Transform Your Practice in{" "}
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Three Simple Steps
                </span>
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Our AI-powered platform streamlines your entire workflow, from client intake to meal plan delivery. 
                Say goodbye to hours of manual planning and hello to more time for what matters—helping your clients succeed.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Quick Data Collection</h4>
                    <p className="text-sm text-gray-400">Capture all essential client information in minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Intelligent AI Analysis</h4>
                    <p className="text-sm text-gray-400">Let our AI create personalized, science-backed meal plans</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Instant Delivery</h4>
                    <p className="text-sm text-gray-400">Review, approve, and send—all in one seamless flow</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - CardSwap */}
            <div style={{ height: '600px', position: 'relative' }}>
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={false}
              >
                <Card>
                  <div className="p-8 bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl border border-white/10 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-white">Step 1: Client Intake</h3>
                      <p className="text-gray-300 text-lg">
                        Gather your client&apos;s health data, dietary preferences, and goals through our intuitive intake form.
                      </p>
                    </div>
                    <svg className="w-24 h-24 mx-auto mt-6 opacity-80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="15" y="20" width="70" height="60" rx="4" stroke="#a78bfa" strokeWidth="2" fill="none"/>
                      <line x1="25" y1="35" x2="75" y2="35" stroke="#a78bfa" strokeWidth="2"/>
                      <circle cx="30" cy="50" r="3" fill="#a78bfa"/>
                      <line x1="40" y1="48" x2="70" y2="48" stroke="#a78bfa" strokeWidth="1.5"/>
                      <circle cx="30" cy="65" r="3" fill="#a78bfa"/>
                      <line x1="40" y1="63" x2="70" y2="63" stroke="#a78bfa" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </Card>
                <Card>
                  <div className="p-8 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-2xl border border-white/10 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-white">Step 2: AI-Powered Analysis</h3>
                      <p className="text-gray-300 text-lg">
                        Our advanced AI analyzes the data and generates a personalized meal plan tailored to your client&apos;s unique needs.
                      </p>
                    </div>
                    <svg className="w-24 h-24 mx-auto mt-6 opacity-80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="30" stroke="#06b6d4" strokeWidth="2" fill="none"/>
                      <circle cx="50" cy="50" r="20" stroke="#06b6d4" strokeWidth="1.5" fill="none"/>
                      <circle cx="50" cy="50" r="10" fill="#06b6d4" opacity="0.6"/>
                      <line x1="50" y1="20" x2="50" y2="10" stroke="#06b6d4" strokeWidth="2"/>
                      <line x1="80" y1="50" x2="90" y2="50" stroke="#06b6d4" strokeWidth="2"/>
                      <line x1="70" y1="30" x2="77" y2="23" stroke="#06b6d4" strokeWidth="2"/>
                    </svg>
                  </div>
                </Card>
                <Card>
                  <div className="p-8 bg-gradient-to-br from-cyan-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl border border-white/10 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-white">Step 3: Review & Send</h3>
                      <p className="text-gray-300 text-lg">
                        Review, customize if needed, and send the plan directly to your client—all in seconds.
                      </p>
                    </div>
                    <svg className="w-24 h-24 mx-auto mt-6 opacity-80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 50 L40 65 L80 30" stroke="#22d3ee" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="50" cy="50" r="35" stroke="#22d3ee" strokeWidth="2" fill="none" opacity="0.5"/>
                      <circle cx="50" cy="50" r="3" fill="#22d3ee"/>
                    </svg>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID SECTION */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Powerful Features
          </h2>
          <BentoDemo />
        </div>
      </section>

      {/* TESTIMONIALS MARQUEE SECTION */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            What Our Users Say
          </h2>
          <MarqueeDemo />
        </div>
      </section>
    </div>
  );
}

// Testimonials data
const reviews = [
  {
    name: "Sarah Johnson",
    username: "@sarahj",
    body: "This tool has revolutionized how I manage my clients' nutrition plans. The AI suggestions are incredibly accurate!",
    img: "https://avatar.vercel.sh/sarahj",
  },
  {
    name: "Mike Chen",
    username: "@mikechen",
    body: "I've never seen anything like this before. It saves me hours every week. Absolutely amazing!",
    img: "https://avatar.vercel.sh/mikechen",
  },
  {
    name: "Emily Rodriguez",
    username: "@emilyrod",
    body: "The personalized meal plans are spot-on. My clients love the variety and attention to detail.",
    img: "https://avatar.vercel.sh/emilyrod",
  },
  {
    name: "David Park",
    username: "@davidp",
    body: "As a nutritionist, this is the best investment I've made. The Med Scan feature is a game-changer!",
    img: "https://avatar.vercel.sh/davidp",
  },
  {
    name: "Lisa Thompson",
    username: "@lisathompson",
    body: "My practice has grown 3x since using this platform. The AI-powered insights are incredible.",
    img: "https://avatar.vercel.sh/lisathompson",
  },
  {
    name: "James Wilson",
    username: "@jameswilson",
    body: "The seamless integration with my workflow makes client management effortless. Highly recommend!",
    img: "https://avatar.vercel.sh/jameswilson",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // dark theme with purple/cyan accents matching the background
        "border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm",
        "hover:border-purple-500/40 hover:from-purple-900/40 hover:to-blue-900/40 transition-all duration-300"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-purple-300/60">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-gray-300">{body}</blockquote>
    </figure>
  );
};

function MarqueeDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#05050F] to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#05050F] to-transparent"></div>
    </div>
  );
}
