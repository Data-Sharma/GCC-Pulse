import type { Metadata } from "next";
import { ReportsWorkspace } from "@/components/gcc/personal-workspace";

export const metadata: Metadata = { title: "Saved reports — GCC Pulse" };

export default function ReportsPage() {
  return <ReportsWorkspace />;
}
