import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "GCC Pulse — India GCC Intelligence",
  description: "Evidence-backed intelligence for India's Global Capability Centre ecosystem.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();
  
  // If user is authenticated, show the app shell with navigation
  if (user) {
    return <html lang="en"><body><AppShell>{children}</AppShell></body></html>;
  }

  // Unauthenticated users see public pages (landing, sign-in) without app shell
  return <html lang="en"><body>{children}</body></html>;
}
