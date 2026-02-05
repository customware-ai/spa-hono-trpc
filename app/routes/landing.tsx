/**
 * Landing Page - Template Demo Only
 *
 * ⚠️ TEMPLATE NOTICE: This landing page is ONLY for the demo/template version.
 * Remove this entire file and its route when building your actual application.
 *
 * Production applications should NOT have a landing page like this.
 * Instead, the dashboard or login page should be the entry point.
 *
 * To remove:
 * 1. Delete this file (app/routes/landing.tsx)
 * 2. Update app/routes.ts to use your actual index route
 * 3. Remove landing page animations from tailwind.config.ts
 */

import type { ReactElement } from "react";
import { Link } from "react-router";

/**
 * Animated Gear Component
 * Creates a rotating gear SVG with customizable size and animation direction
 */
function Gear({
  size = 80,
  className = "",
  reverse = false,
  delay = 0,
}: {
  size?: number;
  className?: string;
  reverse?: boolean;
  delay?: number;
}): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${className} ${reverse ? "animate-[spin_8s_linear_infinite_reverse]" : "animate-[spin_6s_linear_infinite]"}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <path
        d="M50 10 L54 10 L56 20 C60 21 64 23 67 26 L76 22 L80 26 L74 34 C77 38 79 42 80 46 L90 48 L90 52 L80 54 C79 58 77 62 74 66 L80 74 L76 78 L67 74 C64 77 60 79 56 80 L54 90 L46 90 L44 80 C40 79 36 77 33 74 L24 78 L20 74 L26 66 C23 62 21 58 20 54 L10 52 L10 48 L20 46 C21 42 23 38 26 34 L20 26 L24 22 L33 26 C36 23 40 21 44 20 L46 10 Z M50 35 A15 15 0 1 0 50 65 A15 15 0 1 0 50 35"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

/**
 * Animated Progress Bar Component
 * Shows a looping progress animation to indicate "building in progress"
 */
function ProgressBar(): ReactElement {
  return (
    <div className="w-full max-w-[300px] animate-fade-up [animation-delay:0.2s] [animation-fill-mode:both]">
      {/* Track */}
      <div className="h-1 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div className="h-full w-1/4 bg-gradient-to-r from-zinc-600 to-zinc-500 dark:from-zinc-400 dark:to-zinc-300 animate-progress-loop" />
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={`dot-${i}`}
            className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-700 animate-pulse-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Floating Particle Component
 * Creates ambient floating elements for visual interest
 */
function FloatingParticles(): ReactElement {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {[...Array(12)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-zinc-400 dark:bg-zinc-500 animate-float"
          style={{
            left: `${10 + ((i * 7) % 80)}%`,
            top: `${15 + ((i * 11) % 70)}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${4 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Landing Page Component
 *
 * ⚠️ REMOVE FOR PRODUCTION: This is a demo-only landing page.
 *
 * An industrial-themed "under construction" style page that:
 * - Informs users their app is being built
 * - Provides access to the demo dashboard
 * - Uses animated elements for visual engagement
 *
 */
export default function LandingPage(): ReactElement {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Background Grid Pattern - light mode */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      {/* Background Grid Pattern - dark mode */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Decorative Gears */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <Gear
          size={120}
          className="absolute top-[10%] left-[5%] text-zinc-300 dark:text-zinc-700/30"
        />
        <Gear
          size={80}
          className="absolute top-[15%] right-[8%] text-zinc-300 dark:text-zinc-700/30"
          reverse
          delay={0.5}
        />
        <Gear
          size={60}
          className="absolute bottom-[20%] left-[10%] text-zinc-300 dark:text-zinc-700/30"
          delay={1}
        />
        <Gear
          size={100}
          className="absolute bottom-[15%] right-[5%] text-zinc-300 dark:text-zinc-700/30"
          reverse
          delay={0.3}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium tracking-wide animate-fade-up transition-shadow hover:shadow-[0_0_15px_0_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_15px_0_rgba(255,255,255,0.1)]">
          <span className="w-2 h-2 bg-zinc-500 dark:bg-zinc-400 animate-pulse-dot" />
          <span>Building in Progress</span>
        </div>

        {/* Main Heading */}
        <h1 className="mt-8 flex flex-col gap-1 animate-fade-up [animation-delay:0.1s] [animation-fill-mode:both]">
          <span className="text-4xl sm:text-5xl font-semibold text-zinc-500 dark:text-zinc-400 tracking-tight">
            Sit tight
          </span>
          <span className="text-5xl sm:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight">
            We&apos;re building your app
          </span>
        </h1>

        {/* Progress Indicator */}
        <div className="mt-10 w-full flex justify-center">
          <ProgressBar />
        </div>

        {/* Description */}
        <p className="mt-8 text-lg text-zinc-600 dark:text-zinc-500 leading-relaxed animate-fade-up [animation-delay:0.3s] [animation-fill-mode:both]">
          In the meanwhile, you can explore a demo application
          <br className="hidden sm:block" /> that{" "}
          <strong className="text-zinc-900 dark:text-white font-semibold">
            Customware AI
          </strong>{" "}
          has built.
        </p>

        {/* CTA Button */}
        <Link
          to="/dashboard"
          className="group relative rounded-none inline-flex items-center gap-3 mt-10 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-lg font-semibold overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:shadow-[0_8px_25px_rgba(0,0,0,0.25)] shadow-[0_4px_15px_rgba(0,0,0,0.15)] animate-fade-up [animation-delay:0.4s] [animation-fill-mode:both]"
        >
          <span className="relative z-10">Explore Demo</span>
          <span className="relative z-10 flex transition-transform duration-200 group-hover:translate-x-1">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
          {/* Shine effect */}
          <span
            className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"
            aria-hidden="true"
          />
        </Link>

        {/* Footer Note */}
        <p className="mt-12 text-sm text-zinc-500 dark:text-zinc-700 uppercase tracking-widest animate-fade-up [animation-delay:0.5s] [animation-fill-mode:both]">
          Powered by industrial-grade engineering
        </p>
      </main>

      {/* Bottom Decoration - Industrial Stripes - Light Mode */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 dark:hidden animate-stripe-move"
        style={{
          background:
            "repeating-linear-gradient(90deg, #18181b 0px, #18181b 20px, #fafafa 20px, #fafafa 40px)",
        }}
        aria-hidden="true"
      />
      {/* Bottom Decoration - Industrial Stripes - Dark Mode */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 hidden dark:block animate-stripe-move"
        style={{
          background:
            "repeating-linear-gradient(90deg, #fafafa 0px, #fafafa 20px, #09090b 20px, #09090b 40px)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
