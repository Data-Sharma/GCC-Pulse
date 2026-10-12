import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-container">
      <div className="surface p-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-700">404</p>
        <h1 className="mt-3 text-2xl font-bold">Record not found</h1>
        <p className="muted mx-auto mt-2 max-w-lg text-sm leading-6">
          This record may have been removed, or the link may be incorrect.
        </p>
        <Link href="/companies" className="btn btn-primary mt-5">Back to registry</Link>
      </div>
    </div>
  );
}
