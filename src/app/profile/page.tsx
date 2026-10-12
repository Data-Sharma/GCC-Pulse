import type { Metadata } from "next";
import { ProfileWorkspace } from "@/components/gcc/personal-workspace";

export const metadata: Metadata = { title: "Company profile — GCC Pulse" };

export default function ProfilePage() {
  return <ProfileWorkspace />;
}
