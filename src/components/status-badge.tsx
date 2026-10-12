export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const klass = normalized === "approved" || normalized === "confirmed" || normalized === "active"
    ? "status status-approved"
    : normalized === "rejected" ? "status status-rejected"
    : `status status-${normalized}`;
  return <span className={klass}>{status.replaceAll("_", " ")}</span>;
}
