"use client";

import Link from "next/link";
import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-3xl -z-10" />

      <Link
        href="/"
        className="text-purple-400/60 hover:text-purple-300 text-sm mb-8 transition-colors"
      >
        &larr; Back to home
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        Upload Your Report
      </h1>
      <p className="text-purple-300/60 mb-10">
        Select an event and upload your PDF to get started
      </p>

      <UploadForm />
    </main>
  );
}
