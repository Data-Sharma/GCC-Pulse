import type { Metadata } from "next";
import { ReportWorkspace } from "@/components/gcc/personal-workspace";

export const metadata: Metadata = { title: "GCC planning report — GCC Pulse" };

export default async function ReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  return <ReportWorkspace reportId={reportId} />;
}
