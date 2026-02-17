"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getJobStatus } from "@/lib/api";
import { GradingResult } from "@/types/grading";
import LoadingSpinner from "@/components/LoadingSpinner";
import ScoreBreakdown from "@/components/ScoreBreakdown";

const POLL_INTERVAL = 2000;
const POLL_TIMEOUT = 60000;

export default function ResultsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [status, setStatus] = useState<string>("pending");
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const startTime = Date.now();

    const poll = async () => {
      try {
        const data = await getJobStatus(jobId);
        setStatus(data.status);

        if (data.status === "complete" && data.result) {
          setResult(data.result);
          clearInterval(interval);
          return;
        }

        if (data.status === "failed") {
          setError(data.error || "Grading failed. Please try again.");
          clearInterval(interval);
          return;
        }

        if (Date.now() - startTime > POLL_TIMEOUT) {
          setError("Request timed out. Please try again.");
          clearInterval(interval);
        }
      } catch {
        setError("Failed to check status. Is the backend running?");
        clearInterval(interval);
      }
    };

    poll();
    interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [jobId]);

  const statusMessage =
    status === "pending"
      ? "Waiting in queue..."
      : status === "processing"
      ? "Grading your report..."
      : "";

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-3xl -z-10" />

      <Link
        href="/upload"
        className="text-purple-400/60 hover:text-purple-300 text-sm mb-8 transition-colors"
      >
        &larr; Upload another report
      </Link>

      {/* Loading state */}
      {!result && !error && (
        <div className="flex flex-col items-center justify-center mt-20">
          <LoadingSpinner message={statusMessage} />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-20 text-center">
          <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 mb-6">
            {error}
          </p>
          <Link
            href="/upload"
            className="text-purple-400 hover:text-purple-300 underline transition-colors"
          >
            Try again
          </Link>
        </div>
      )}

      {/* Results */}
      {result && <ScoreBreakdown result={result} />}
    </main>
  );
}
