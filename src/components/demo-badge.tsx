export function DemoBadge({ children = "Demo data" }: { children?: React.ReactNode }) {
  return (
    <span className="demo-badge" aria-label="Demo data">
      <span aria-hidden="true" />
      {children}
    </span>
  );
}
