import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import FeedbackNote from '../components/FeedbackNote';
import Loader from '../components/Loader';
import { CATEGORIES } from '../utils/constants';

// Row of colour-coded category pills, shared with the Received page
export function CategoryFilter({ value, onChange, items }) {
  const counts = items.reduce((acc, f) => ({ ...acc, [f.category]: (acc[f.category] || 0) + 1 }), {});
  return (
    <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <button type="button" onClick={() => onChange('')} aria-pressed={!value}
        className={`rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-bold ${!value ? 'bg-ink text-white' : 'bg-white'}`}>
        All {items.length}
      </button>
      {CATEGORIES.filter((c) => counts[c.name]).map((c) => (
        <button key={c.name} type="button" onClick={() => onChange(c.name)} aria-pressed={value === c.name}
          className={`rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-bold ${c.bg} ${
            value === c.name ? 'shadow-hard-sm ring-2 ring-ink ring-offset-2 ring-offset-desk' : ''
          }`}>
          {c.name} {counts[c.name]}
        </button>
      ))}
    </div>
  );
}

export default function Given() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    api
      .get('/feedback/given')
      .then((res) => setFeedback(res.data.feedback))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(
    () => (category ? feedback.filter((f) => f.category === category) : feedback),
    [feedback, category]
  );

  const people = new Set(feedback.map((f) => f.givenTo?._id).filter(Boolean)).size;

  if (loading) return <Loader label="Collecting your notes" />;

  return (
    <div className="pt-8">
      <h1 className="text-4xl font-extrabold tracking-tight">
        <span className="marker-title">Notes I wrote</span>
      </h1>

      {feedback.length === 0 ? (
        <div className="mt-8 rounded-[18px] border-2 border-dashed border-ink/40 p-10 text-center">
          <p className="text-lg font-bold">You haven't written any notes yet.</p>
          <p className="mt-1 text-ink-soft">Think of someone who helped on a project and tell them.</p>
          <Link to="/students" className="btn btn-primary mt-5">Write your first note</Link>
        </div>
      ) : (
        <>
          <p className="mt-3 text-lg text-ink-soft">
            You've written <strong className="text-ink">{feedback.length}</strong>{' '}
            {feedback.length === 1 ? 'note' : 'notes'} for <strong className="text-ink">{people}</strong>{' '}
            {people === 1 ? 'batchmate' : 'batchmates'}.
          </p>

          <CategoryFilter value={category} onChange={setCategory} items={feedback} />

          <div className="mt-9 grid items-start gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((f, i) => (
              <FeedbackNote key={f._id} feedback={f} mode="given" index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
