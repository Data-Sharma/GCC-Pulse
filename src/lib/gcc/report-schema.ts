import { z } from "zod";

export const GccReportSchema = z.object({
  title: z.string().trim().min(1).max(200),
  executiveSummary: z.string().trim().min(1).max(5000),
  sections: z.array(z.object({
    id: z.enum(["landscape", "location", "talent", "real-estate", "policy", "providers", "setup", "action-plan"]),
    title: z.string().trim().min(1).max(200),
    summary: z.string().trim().min(1).max(5000),
    evidenceStatus: z.enum(["supported", "partial", "insufficient"]),
    findings: z.array(z.object({
      text: z.string().trim().min(1).max(2000),
      kind: z.enum(["evidence", "analysis", "question", "unknown"]),
      sourceIds: z.array(z.string().uuid()).max(10).default([]),
      chunkIds: z.array(z.string().uuid()).max(10).default([]),
    })).max(30),
  })).min(1).max(12),
  actionPlan: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string().trim().min(1).max(1000),
    rationale: z.string().trim().min(1).max(1500),
  })).max(20),
  limitations: z.array(z.string().trim().min(1).max(1000)).max(30),
});

export type GccReport = z.infer<typeof GccReportSchema>;
