import type { Metadata } from "next";
import { DemoReport } from "@/components/reporting/demo-report";

export const metadata: Metadata = {
  title: "Your GCC planning preview — GCC Pulse",
  description: "A personalized illustrative GCC planning report preview.",
};

export default function DemoReportPage() {
  return <DemoReport />;
}
