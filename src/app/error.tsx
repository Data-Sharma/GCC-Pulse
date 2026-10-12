"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("GCC Pulse page error", error);
  }, [error]);

  return (
    <div className="app-container">
      <div className="surface p-8" role="alert">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="muted mt-2 text-sm leading-6">
          The page could not be loaded. Retry, or return to the dashboard.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => reset()}>Try again</button>
          <Link className="btn btn-secondary" href="/">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
