export default function Loading() {
  return (
    <div className="app-container" role="status" aria-live="polite">
      <div className="surface animate-pulse p-8">
        <div className="h-7 w-64 rounded bg-slate-200" />
        <div className="mt-4 h-4 w-96 max-w-full rounded bg-slate-100" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="h-28 rounded-xl bg-slate-100" />
          <div className="h-28 rounded-xl bg-slate-100" />
          <div className="h-28 rounded-xl bg-slate-100" />
        </div>
        <span className="sr-only">Loading GCC Pulse…</span>
      </div>
    </div>
  );
}
