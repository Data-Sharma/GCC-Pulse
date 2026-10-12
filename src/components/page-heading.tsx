export function PageHeading({ eyebrow, title, description, action }: {
  eyebrow?: string; title: string; description: string; action?: React.ReactNode;
}) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-blue-700">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">{description}</p>
    </div>
    {action}
  </div>;
}
