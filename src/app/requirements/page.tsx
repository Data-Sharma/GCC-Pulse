import type { Metadata } from "next";
import { RequirementsWizard } from "@/components/reporting/requirements-wizard";

export const metadata: Metadata = {
  title: "Plan your GCC report — GCC Pulse",
  description: "Create a private, browser-local illustrative GCC planning report.",
};

export default function RequirementsPage() {
  return <RequirementsWizard />;
}
