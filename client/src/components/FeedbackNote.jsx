import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { categoryMeta, formatDate, tiltFor } from '../utils/constants';

/**
 * A single feedback shown as a sticky note.
 * mode = "received" -> shows who wrote it (or Anonymous)
 * mode = "given"    -> shows who it was written for
 */
export default function FeedbackNote({ feedback, mode = 'received', index = 0 }) {
  const meta = categoryMeta(feedback.category);
  const person = mode === 'received' ? feedback.givenBy : feedback.givenTo;

  return (
    <article
      className={`note note-pin ${meta.bg}`}
      style={{ '--tilt': `${tiltFor(feedback._id, index)}deg`, animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[13px] font-extrabold">{feedback.category}</span>
        <StarRating value={feedback.rating} size={15} />
      </div>

      <p className="font-hand text-[23px] leading-[1.15] text-ink">{feedback.comment}</p>

      <footer className="mt-4 flex items-end justify-between gap-2 border-t-[1.5px] border-dashed border-ink/30 pt-2.5 text-[13px]">
        <span className="min-w-0 font-semibold">
          {mode === 'received' ? (
            person ? (
              <>From {person.name}</>
            ) : (
              <span className="inline-flex items-center gap-1 text-ink-soft">
                <MaskIcon /> Anonymous
              </span>
            )
          ) : person ? (
            <>
              For{' '}
              <Link to={`/students/${person._id}`} className="underline decoration-2 underline-offset-2 hover:text-grape">
                {person.name}
              </Link>
              {feedback.isAnonymous && <span className="ml-1.5 text-ink-soft">(sent anonymously)</span>}
            </>
          ) : (
            <span className="text-ink-soft">Student removed</span>
          )}
        </span>
        <time className="shrink-0 text-ink-soft" dateTime={feedback.createdAt}>
          {formatDate(feedback.createdAt)}
        </time>
      </footer>
    </article>
  );
}

export function MaskIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9c3-2 15-2 18 0 0 5-2.5 7-5 7-1.6 0-2.5-1.5-4-1.5S9.6 16 8 16c-2.5 0-5-2-5-7z" strokeLinejoin="round" />
      <circle cx="8.5" cy="10.5" r="1.3" fill="currentColor" />
      <circle cx="15.5" cy="10.5" r="1.3" fill="currentColor" />
    </svg>
  );
}
