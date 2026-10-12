import { LogOut } from "lucide-react";
import { getUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { WorkspaceShell } from "@/components/workspace-shell";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const email = user?.email ?? "Workspace user";
  const accountType = user?.user_metadata?.account_type === "organization"
    ? "Organization account"
    : user?.user_metadata?.account_type === "personal"
      ? "Personal account"
      : undefined;

  return (
    <WorkspaceShell
      email={email}
      accountType={accountType}
      logoutForm={
        user ? (
          <form action={signOut}>
            <button type="submit" className="logout-button"><LogOut size={15} />Log out</button>
          </form>
        ) : null
      }
    >
      {children}
    </WorkspaceShell>
  );
}
