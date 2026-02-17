"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Glow effect behind heading */}
      <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10" />

      <h1 className="text-5xl md:text-7xl font-bold text-center mb-6">
        <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
          AI Rubric Evaluator
        </span>
      </h1>

      <p className="text-purple-200/70 text-lg md:text-xl text-center max-w-2xl mb-10">
        Upload your DECA report and get instant, rubric-based grading powered by AI.
        Section-by-section feedback to help you improve.
      </p>

      <Link
        href="/upload"
        className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold text-lg hover:from-purple-500 hover:to-fuchsia-500 transition-all duration-200 shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50"
      >
        Get Started
      </Link>
    </main>
  );
}
