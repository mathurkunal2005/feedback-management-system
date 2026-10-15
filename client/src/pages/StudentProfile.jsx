import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import StarRating from '../components/StarRating';
import { CATEGORIES, categoryMeta, yearLabel } from '../utils/constants';

const EMPTY_NOTE = { category: '', rating: 0, comment: '', isAnonymous: false };

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [note, setNote] = useState(EMPTY_NOTE);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return api
      .get(`/students/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else toast.error(errorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    load();
  }, [load]);

  // You can't open your own profile here: send to your received notes
  if (id === user._id) return <Navigate to="/received" replace />;
  if (loading) return <Loader />;
  if (notFound || !data) {
    return (
      <div className="py-24 text-center">
        <p className="text-2xl font-extrabold">This student isn't in the list anymore.</p>
        <Link to="/students" className="btn btn-ghost mt-5">Back to batchmates</Link>
      </div>
    );
  }

  const { student, avgRating, feedbackCount, byCategory, givenByMe } = data;
  const first = student.name.split(' ')[0];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!note.category) return setError('Pick what this note is about');
    if (!note.rating) return setError('Give a rating from 1 to 5 stars');
    if (note.comment.trim().length < 5) return setError('Write at least a short sentence');
    setError('');
    setBusy(true);
    try {
      await api.post('/feedback', { ...note, comment: note.comment.trim(), givenTo: student._id });
      toast.success(`Note sent to ${first}`);
      setNote(EMPTY_NOTE);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const activeColor = note.category ? categoryMeta(note.category).bg : 'bg-white';

  return (
    <div className="pt-6">
      <Link to="/students" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft hover:text-ink">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All batchmates
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* profile */}
        <aside className="panel h-fit p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar name={student.name} size="lg" />
            <h1 className="mt-4 text-2xl font-extrabold leading-tight">{student.name}</h1>
            <p className="font-semibold text-ink-soft">{student.rollNo}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <span className="chip">{student.department}</span>
              <span className="chip">{yearLabel(student.year)}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-[14px] border-2 border-ink bg-marker px-4 py-3">
            <div>
              <div className="text-[34px] font-extrabold leading-none">{feedbackCount ? avgRating : '–'}</div>
              <div className="mt-1 text-xs font-bold">average rating</div>
            </div>
            <div className="text-right">
              <div className="text-[34px] font-extrabold leading-none">{feedbackCount}</div>
              <div className="mt-1 text-xs font-bold">{feedbackCount === 1 ? 'note' : 'notes'} received</div>
            </div>
          </div>

          {byCategory.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-extrabold">Ratings by area</h2>
              <ul className="mt-3 space-y-2.5">
                {byCategory.map((c) => (
                  <li key={c.category}>
                    <div className="mb-1 flex justify-between text-[13px] font-semibold">
                      <span>{c.category}</span>
                      <span>{c.avgRating} / 5</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border-[1.5px] border-ink bg-white">
                      <div className={`h-full ${categoryMeta(c.category).bg} border-r-[1.5px] border-ink`}
                        style={{ width: `${(c.avgRating / 5) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {givenByMe > 0 && (
            <p className="mt-6 text-center text-[13px] font-semibold text-ink-soft">
              You've left {first} {givenByMe} {givenByMe === 1 ? 'note' : 'notes'} so far.
            </p>
          )}
        </aside>

        {/* write a note */}
        <section>
          <form onSubmit={onSubmit} noValidate
            className={`note ${activeColor} p-6 sm:p-8 transition-colors duration-300`} style={{ paddingTop: 34 }}>
            <h2 className="text-2xl font-extrabold">Write a note for {first}</h2>
            <p className="mt-1 text-[15px] text-ink-soft">
              Be specific and kind. {first} will see this on their notes page.
            </p>

            <fieldset className="mt-6">
              <legend className="field-label">What's it about?</legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const active = note.category === c.name;
                  return (
                    <button key={c.name} type="button" onClick={() => { setNote({ ...note, category: c.name }); setError(''); }}
                      aria-pressed={active}
                      className={`rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-bold transition-all ${c.bg} ${
                        active ? 'shadow-hard-sm -translate-x-px -translate-y-px ring-2 ring-ink ring-offset-2 ring-offset-transparent' : 'opacity-80 hover:opacity-100'
                      }`}>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-6">
              <span className="field-label">Rating</span>
              <StarRating value={note.rating} size={32} onChange={(r) => { setNote({ ...note, rating: r }); setError(''); }} />
            </div>

            <div className="mt-6">
              <label htmlFor="comment" className="field-label">Your note</label>
              <textarea id="comment" rows={5} maxLength={500}
                className="field resize-y font-hand text-[22px] leading-snug"
                placeholder={`e.g. ${first} kept our project on track and explained the tricky parts to everyone.`}
                value={note.comment} onChange={(e) => setNote({ ...note, comment: e.target.value })} />
              <div className="mt-1 text-right text-xs font-semibold text-ink-soft">{note.comment.length} / 500</div>
            </div>

            <label className="mt-2 flex cursor-pointer items-center gap-3 select-none">
              <input type="checkbox" className="peer sr-only" checked={note.isAnonymous}
                onChange={(e) => setNote({ ...note, isAnonymous: e.target.checked })} />
              <span className="relative h-7 w-12 rounded-full border-2 border-ink bg-white transition-colors peer-checked:bg-grape peer-focus-visible:outline-3 peer-focus-visible:outline-grape
                after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border-2 after:border-ink after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
              <span>
                <span className="block text-[15px] font-bold">Send anonymously</span>
                <span className="block text-[13px] text-ink-soft">{first} won't see your name. The admin still can.</span>
              </span>
            </label>

            {error && <p className="field-error mt-4 text-sm">{error}</p>}

            <button type="submit" className="btn btn-primary mt-6 w-full py-3 sm:w-auto sm:px-8" disabled={busy}>
              {busy ? 'Sending…' : 'Send note'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
