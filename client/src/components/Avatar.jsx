const COLORS = ['bg-note-sky', 'bg-note-mint', 'bg-note-peach', 'bg-note-pink', 'bg-note-lilac', 'bg-note-lemon'];

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-20 w-20 text-2xl',
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

export default function Avatar({ name = '', size = 'md' }) {
  const color = COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-ink font-extrabold ${color} ${SIZES[size]}`}
      aria-hidden="true"
    >
      {initials(name) || '?'}
    </span>
  );
}
