import { JobStatus, UploadResponse } from "@/types/grading";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getEvents(): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function uploadPdf(
  file: File,
  eventName: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("event_name", eventName);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail || "Upload failed");
  }

  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_URL}/api/status/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch job status");
  return res.json();
}
