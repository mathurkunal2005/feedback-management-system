export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24" role="status">
      <div className="h-10 w-10 animate-spin rounded-lg border-2 border-ink bg-marker shadow-hard-sm" />
      <span className="text-sm font-semibold text-ink-soft">{label}…</span>
    </div>
  );
}
