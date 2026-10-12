import type { Metadata } from "next";
import { KnowledgeWorkspace } from "@/components/gcc/personal-workspace";

export const metadata: Metadata = { title: "Knowledge base — GCC Pulse" };

export default function KnowledgePage() {
  return <KnowledgeWorkspace />;
}
