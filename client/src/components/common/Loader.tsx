export function Loader() {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-muted">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-secondary [animation-delay:120ms]" />
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent [animation-delay:240ms]" />
      Loading...
    </div>
  );
}
