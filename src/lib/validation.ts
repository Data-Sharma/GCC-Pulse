import { z } from "zod";

export const signalTypes = ["new_gcc", "expansion", "office", "hiring", "other"] as const;

export const ExtractionSchema = z.object({
  company_name: z.string().max(300),
  parent_company: z.string().max(300),
  industry: z.string().max(200),
  city: z.string().max(200),
  announcement_date: z.string().max(80),
  signal_type: z.enum(signalTypes),
  summary: z.string().max(2000),
  evidence_quote: z.string().max(1500),
  uncertainty: z.string().max(1500),
});

export const ExtractRequestSchema = z.object({
  text: z.string().trim().min(50).max(20000),
  sourceTitle: z.string().trim().max(500).optional().default("Untitled source"),
  sourceUrl: z.union([z.string().url().max(2000), z.literal("")]).optional().default(""),
  publisher: z.string().trim().max(300).optional().default(""),
  publishedAt: z.string().trim().max(40).optional().default(""),
});

export const SaveClaimSchema = z.object({
  source: z.object({
    title: z.string().trim().min(1).max(500),
    url: z.union([z.string().url().max(2000), z.literal("")]).optional().default(""),
    publisher: z.string().trim().max(300).optional().default(""),
    publishedAt: z.string().trim().max(40).optional().default(""),
    sourceText: z.string().trim().min(50).max(20000),
  }),
  extraction: ExtractionSchema,
});

export const ReviewSchema = z.object({
  action: z.enum(["approve", "reject", "edit"]),
  claimText: z.string().trim().min(1).max(3000).optional(),
});

export type Extraction = z.infer<typeof ExtractionSchema>;
