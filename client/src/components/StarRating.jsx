import { useState } from 'react';

function Star({ filled, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 2.8l2.75 5.82 6.35.8-4.66 4.4 1.2 6.3L12 17.03l-5.64 3.09 1.2-6.3L2.9 9.42l6.35-.8L12 2.8z"
        fill={filled ? '#FFE14D' : '#FFFFFF'}
        stroke="#1F1A3D"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Read-only when no onChange is passed
export default function StarRating({ value = 0, onChange, size = 18 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || Math.round(value);

  if (!onChange) {
    return (
      <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} filled={n <= shown} size={size} />
        ))}
      </span>
    );
  }

  return (
    <div className="inline-flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="cursor-pointer rounded-md p-0.5 transition-transform hover:scale-110"
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
        >
          <Star filled={n <= shown} size={size} />
        </button>
      ))}
    </div>
  );
}
