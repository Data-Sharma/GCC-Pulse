"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, Menu, X } from "lucide-react";
import { openPublicChat } from "@/components/landing/public-chatbot";

const links = [
  { href: "#platform", label: "Platform" },
  { href: "#intelligence", label: "Intelligence" },
  { href: "#evidence", label: "Evidence" },
  { href: "#about", label: "About" },
  { href: "/requirements", label: "Plan your GCC" },
];

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <Link
          href="/"
          className="landing-wordmark"
          aria-label="GCC Pulse home"
          onClick={() => setMenuOpen(false)}
        >
          GCC <span>Pulse</span>
        </Link>

        <nav className="landing-nav-desktop" aria-label="Main navigation">
          {links.map(({ href, label }) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
          <button type="button" className="landing-chat-nav-button" onClick={openPublicChat}><MessageCircle size={14} />Ask GCC Pulse</button>
        </nav>

        <div className="landing-header-actions">
          <Link className="landing-signin-link" href="/sign-in">
            Sign in
          </Link>
          <Link className="landing-button landing-button-small" href="/sign-in#create-account">
            Get started <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
          <button
            type="button"
            className="landing-menu-toggle"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="landing-mobile-menu"
          className="landing-mobile-menu"
          aria-label="Mobile navigation"
        >
          {links.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          <button type="button" onClick={() => { setMenuOpen(false); openPublicChat(); }}><MessageCircle size={14} />Ask GCC Pulse</button>
          <Link href="/sign-in" onClick={() => setMenuOpen(false)}>Sign in</Link>
          <Link
            className="landing-mobile-cta"
            href="/sign-in#create-account"
            onClick={() => setMenuOpen(false)}
          >
            Create your account <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </nav>
      )}
    </header>
  );
}
