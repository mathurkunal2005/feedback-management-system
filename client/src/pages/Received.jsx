import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import FeedbackNote from '../components/FeedbackNote';
import Loader from '../components/Loader';
import { CategoryFilter } from './Given';

export default function Received() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    api
      .get('/feedback/received')
      .then((res) => setFeedback(res.data.feedback))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(
    () => (category ? feedback.filter((f) => f.category === category) : feedback),
    [feedback, category]
  );

  const avg = feedback.length
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : null;

  // strongest area = highest average among categories
  const strongest = useMemo(() => {
    const groups = {};
    feedback.forEach((f) => {
      groups[f.category] = groups[f.category] || [];
      groups[f.category].push(f.rating);
    });
    let best = null;
    Object.entries(groups).forEach(([cat, r]) => {
      const a = r.reduce((x, y) => x + y, 0) / r.length;
      if (!best || a > best.avg) best = { cat, avg: a };
    });
    return best?.cat;
  }, [feedback]);

  if (loading) return <Loader label="Collecting your notes" />;

  return (
    <div className="pt-8">
      <h1 className="text-4xl font-extrabold tracking-tight">
        <span className="marker-title">Notes for me</span>
      </h1>

      {feedback.length === 0 ? (
        <div className="mt-8 rounded-[18px] border-2 border-dashed border-ink/40 p-10 text-center">
          <p className="text-lg font-bold">No one has left you a note yet.</p>
          <p className="mt-1 text-ink-soft">Leave a few for your batchmates. They tend to write back.</p>
          <Link to="/students" className="btn btn-primary mt-5">Browse batchmates</Link>
        </div>
      ) : (
        <>
          <p className="mt-3 text-lg text-ink-soft">
            {feedback.length} {feedback.length === 1 ? 'note' : 'notes'}, averaging{' '}
            <strong className="text-ink">{avg} stars</strong>
            {strongest && (
              <>. People rate you highest for <strong className="text-ink">{strongest.toLowerCase()}</strong></>
            )}
            .
          </p>

          <CategoryFilter value={category} onChange={setCategory} items={feedback} />

          {shown.length === 0 ? (
            <p className="mt-10 text-center font-semibold text-ink-soft">No notes in this category yet.</p>
          ) : (
            <div className="mt-9 grid items-start gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((f, i) => (
                <FeedbackNote key={f._id} feedback={f} mode="received" index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
