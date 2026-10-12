export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="surface p-8 text-center">
    <h2 className="font-bold">{title}</h2>
    <p className="muted mt-2 text-sm leading-6">{description}</p>
  </div>;
}
