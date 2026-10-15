// Each category gets its own sticky-note colour (full class names so Tailwind picks them up)
export const CATEGORIES = [
  { name: 'Technical Skills', bg: 'bg-note-sky', hex: '#BFE3FF' },
  { name: 'Communication', bg: 'bg-note-lemon', hex: '#FFF1A8' },
  { name: 'Teamwork', bg: 'bg-note-mint', hex: '#C3F2D6' },
  { name: 'Behaviour', bg: 'bg-note-pink', hex: '#FFC9DE' },
  { name: 'Leadership', bg: 'bg-note-lilac', hex: '#DCD0FF' },
  { name: 'Punctuality', bg: 'bg-note-peach', hex: '#FFD3B0' },
];

export const categoryMeta = (name) =>
  CATEGORIES.find((c) => c.name === name) || { name, bg: 'bg-white', hex: '#FFFFFF' };

export const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'CSE-AI/ML', 'ME'];
export const YEARS = [1, 2, 3, 4];

export const yearLabel = (y) => ['', '1st year', '2nd year', '3rd year', '4th year'][y] || '';

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// small, stable tilt per note so the board looks hand-pinned
export const tiltFor = (id = '', i = 0) => {
  const seed = [...String(id)].reduce((a, c) => a + c.charCodeAt(0), i);
  return ((seed % 5) - 2) * 0.8; // between -1.6deg and +1.6deg
};
