"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Bell,
  Building2,
  ChevronDown,
  FileSearch,
  FileText,
  MapPinned,
  Menu,
  Radar,
  Search,
  ShieldCheck,
  Users,
  UserRound,
  BookOpen,
  X,
} from "lucide-react";

const navigation = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/companies", label: "GCC Registry", icon: Building2 },
  { href: "/cities", label: "City Intelligence", icon: MapPinned },
  { href: "/signals", label: "Expansion Radar", icon: Radar },
  { href: "/providers", label: "Provider Directory", icon: Users },
  { href: "/extract", label: "AI Extraction", icon: FileSearch },
  { href: "/review", label: "Evidence Review", icon: ShieldCheck },
  { href: "/profile", label: "Company Profile", icon: UserRound },
  { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/reports", label: "Saved Reports", icon: FileText },
];

export function WorkspaceShell({
  children,
  email,
  accountType,
  logoutForm,
}: {
  children: ReactNode;
  email: string;
  accountType?: string;
  logoutForm: ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = email.split("@")[0]?.slice(0, 2).toUpperCase() || "GP";

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.getElementById("workspace-menu-toggle")?.focus();
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <div className="workspace-shell">
      <aside className={`workspace-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <Link href="/" className="workspace-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">G</span><span>GCC <b>Pulse</b><small>INDIA GCC INTELLIGENCE</small></span>
        </Link>
        <div className="workspace-nav-label">WORKSPACE</div>
        <nav id="workspace-primary-navigation" aria-label="Workspace navigation" className="workspace-nav">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
            return <Link href={href} key={href} aria-current={active ? "page" : undefined} className={`workspace-nav-link ${active ? "is-active" : ""}`} onClick={() => setMenuOpen(false)}><Icon size={17} aria-hidden="true" /><span>{label}</span>{active && <i aria-hidden="true" />}</Link>;
          })}
        </nav>
        <div className="sidebar-evidence-note"><ShieldCheck size={17} /><p><strong>Evidence first</strong><span>Inspect source context before treating a claim as verified.</span></p></div>
        <div className="sidebar-account"><span className="user-avatar">{initials}</span><span className="sidebar-user-copy"><strong>{email.split("@")[0] || "Workspace user"}</strong><small>{accountType || "Signed-in account"}</small></span>{logoutForm}</div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-topbar">
          <button id="workspace-menu-toggle" className="mobile-menu-toggle" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="workspace-primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          <div className="topbar-context"><span className="topbar-kicker">GCC PULSE</span><span className="topbar-divider">/</span><span>Intelligence workspace</span></div>
          <form className="topbar-search" action="/companies"><Search size={16} aria-hidden="true" /><label className="sr-only" htmlFor="workspace-search">Search company registry</label><input id="workspace-search" name="q" placeholder="Search the registry…" /><button type="submit" aria-label="Search"><Search size={15} /></button></form>
          <Link href="/review" className="topbar-notifications" aria-label="Open evidence review queue" title="Demo review queue"><Bell size={17} /><i /></Link>
          <details className="topbar-account"><summary aria-label={`Account menu for ${email}`}><span className="user-avatar">{initials}</span><span className="topbar-user-email">{email.split("@")[0]}</span><ChevronDown size={14} /></summary><div className="account-popover"><span>{email}</span>{accountType && <small>{accountType}</small>}{logoutForm}</div></details>
        </header>
        <main className="workspace-content">{children}</main>
      </div>
      {menuOpen && <button className="workspace-scrim" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
