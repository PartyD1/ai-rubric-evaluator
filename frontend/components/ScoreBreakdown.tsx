"use client";

import { useState } from "react";
import { GradingResult, SectionScore } from "@/types/grading";

function getScoreColor(pct: number): string {
  if (pct >= 80) return "from-green-500 to-emerald-500";
  if (pct >= 60) return "from-amber-500 to-yellow-500";
  return "from-red-500 to-rose-500";
}

function getScoreBg(pct: number): string {
  if (pct >= 80) return "bg-green-500/10 border-green-500/30";
  if (pct >= 60) return "bg-amber-500/10 border-amber-500/30";
  return "bg-red-500/10 border-red-500/30";
}

function SectionCard({ section }: { section: SectionScore }) {
  const [expanded, setExpanded] = useState(false);
  const pct = section.max_points > 0
    ? (section.awarded_points / section.max_points) * 100
    : 0;

  return (
    <div
      className="bg-[#120020] border border-purple-500/20 rounded-xl p-5 cursor-pointer hover:border-purple-500/40 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">{section.name}</h3>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getScoreBg(pct)}`}>
          {section.awarded_points}/{section.max_points}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-purple-900/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(pct)} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {expanded && (
        <p className="mt-4 text-purple-200/70 text-sm leading-relaxed">
          {section.feedback}
        </p>
      )}

      <p className="text-purple-400/50 text-xs mt-2">
        {expanded ? "Click to collapse" : "Click to expand feedback"}
      </p>
    </div>
  );
}

export default function ScoreBreakdown({ result }: { result: GradingResult }) {
  const overallPct = result.total_possible > 0
    ? (result.total_awarded / result.total_possible) * 100
    : 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Overall score card */}
      <div className="bg-[#1a0030] border border-purple-500/30 rounded-2xl p-8 text-center shadow-lg shadow-purple-600/10">
        <p className="text-purple-300/60 text-sm uppercase tracking-widest mb-2">
          Overall Score
        </p>
        <p className="text-6xl font-bold text-white mb-1">
          {result.total_awarded}
          <span className="text-2xl text-purple-400/60">/{result.total_possible}</span>
        </p>
        <p className="text-purple-300/50 text-sm">{overallPct.toFixed(0)}%</p>

        {/* Overall progress bar */}
        <div className="w-full h-3 bg-purple-900/30 rounded-full overflow-hidden mt-4">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(overallPct)} transition-all duration-700`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Overall feedback */}
      {result.overall_feedback && (
        <div className="bg-[#120020] border border-purple-500/20 rounded-xl p-5">
          <h3 className="text-white font-medium mb-2">Overall Feedback</h3>
          <p className="text-purple-200/70 text-sm leading-relaxed">
            {result.overall_feedback}
          </p>
        </div>
      )}

      {/* Section breakdown */}
      <div className="space-y-3">
        <h2 className="text-white text-lg font-semibold">Section Breakdown</h2>
        {result.sections.map((section) => (
          <SectionCard key={section.name} section={section} />
        ))}
      </div>
    </div>
  );
}
