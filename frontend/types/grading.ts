// Re-exports of backend-generated types (see types/api.gen.ts, generated via
// `npm run gen:types` from the FastAPI OpenAPI schema). Import paths across the
// app stay stable even though the underlying types now come from codegen —
// a backend schema change flows through here automatically on regeneration.
import type { components } from "./api.gen";

export type EventInfo = components["schemas"]["EventInfo"];
export type ClusterEvents = components["schemas"]["ClusterEvents"];
export type SectionScore = components["schemas"]["SectionScore"];
export type PenaltyCheck = components["schemas"]["PenaltyCheck"];
export type SentenceAIScore = components["schemas"]["SentenceAIScore"];
export type AIDetectionResult = components["schemas"]["AIDetectionResult"];
export type GradingResult = components["schemas"]["GradingResult"];
export type JobStatus = components["schemas"]["JobResponse"];
export type UploadResponse = components["schemas"]["UploadResponse"];
export type HistoryItem = components["schemas"]["HistoryItem"];
