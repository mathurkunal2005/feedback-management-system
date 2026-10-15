export default function Logo({ size = 'md' }) {
  const big = size === 'lg';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`relative inline-block -rotate-6 rounded-[4px] border-2 border-ink bg-marker shadow-hard-sm ${
          big ? 'h-9 w-9' : 'h-7 w-7'
        }`}
        aria-hidden="true"
      >
        <span className="absolute left-1.5 right-1.5 top-[38%] h-[2px] rounded bg-ink" />
        <span className="absolute left-1.5 right-3 top-[60%] h-[2px] rounded bg-ink" />
      </span>
      <span className={`font-extrabold tracking-tight ${big ? 'text-3xl' : 'text-xl'}`}>BatchNotes</span>
    </span>
  );
}
