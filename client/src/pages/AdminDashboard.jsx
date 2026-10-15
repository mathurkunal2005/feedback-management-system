import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import Modal, { ConfirmModal } from '../components/Modal';
import StarRating from '../components/StarRating';
import { MaskIcon } from '../components/FeedbackNote';
import { CATEGORIES, categoryMeta, formatDate, yearLabel } from '../utils/constants';

/* ---------------- Stats ---------------- */

function StatTile({ value, label, accent }) {
  return (
    <div className={`panel p-5 ${accent || ''}`}>
      <div className="text-[40px] font-extrabold leading-none tracking-tight">{value}</div>
      <div className="mt-2 text-sm font-bold text-ink-soft">{label}</div>
    </div>
  );
}

function CategoryBar({ byCategory, total }) {
  if (!total) return null;
  return (
    <div className="panel p-5">
      <h2 className="text-sm font-extrabold">What notes are about</h2>
      <div className="mt-3 flex h-6 overflow-hidden rounded-full border-2 border-ink">
        {byCategory.map((c) => (
          <div key={c.category} title={`${c.category}: ${c.count}`}
            className={`${categoryMeta(c.category).bg} border-r-2 border-ink last:border-r-0`}
            style={{ width: `${(c.count / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {byCategory.map((c) => (
          <li key={c.category} className="flex items-center gap-1.5 text-[13px] font-semibold">
            <span className={`h-3 w-3 rounded-[3px] border-[1.5px] border-ink ${categoryMeta(c.category).bg}`} />
            {c.category} <span className="text-ink-soft">{c.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopRated({ students }) {
  return (
    <div className="panel p-5">
      <h2 className="text-sm font-extrabold">Top rated students</h2>
      {students.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Students need at least 2 notes to be ranked.</p>
      ) : (
        <ol className="mt-3 space-y-2.5">
          {students.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-extrabold ${
                i === 0 ? 'bg-marker' : 'bg-white'}`}>
                {i + 1}
              </span>
              <Avatar name={s.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-bold leading-tight">{s.name}</div>
                <div className="text-xs text-ink-soft">{s.rollNo}, {s.count} notes</div>
              </div>
              <span className="text-lg font-extrabold">{s.avgRating}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* ---------------- Edit modal ---------------- */

function EditFeedbackModal({ feedback, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (feedback) {
      setForm({
        category: feedback.category,
        rating: feedback.rating,
        comment: feedback.comment,
        isAnonymous: feedback.isAnonymous,
      });
    }
  }, [feedback]);

  if (!feedback || !form) return null;

  const save = async (e) => {
    e.preventDefault();
    if (form.comment.trim().length < 5) {
      toast.error('Comment must be at least 5 characters');
      return;
    }
    setBusy(true);
    try {
      await api.put(`/admin/feedback/${feedback._id}`, { ...form, comment: form.comment.trim() });
      toast.success('Feedback updated');
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open title="Edit feedback" onClose={onClose}>
      <p className="-mt-2 mb-5 text-sm text-ink-soft">
        From <strong className="text-ink">{feedback.givenBy?.name || 'Removed student'}</strong> to{' '}
        <strong className="text-ink">{feedback.givenTo?.name || 'Removed student'}</strong>
      </p>
      <form onSubmit={save} className="space-y-5">
        <div>
          <span className="field-label">Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.name} type="button" onClick={() => setForm({ ...form, category: c.name })}
                aria-pressed={form.category === c.name}
                className={`rounded-full border-2 border-ink px-3 py-1 text-[13px] font-bold ${c.bg} ${
                  form.category === c.name ? 'ring-2 ring-ink ring-offset-2' : 'opacity-70 hover:opacity-100'}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="field-label">Rating</span>
          <StarRating value={form.rating} size={28} onChange={(r) => setForm({ ...form, rating: r })} />
        </div>
        <div>
          <label htmlFor="edit-comment" className="field-label">Comment</label>
          <textarea id="edit-comment" rows={4} maxLength={500} className="field resize-y"
            value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          <div className="mt-1 text-right text-xs font-semibold text-ink-soft">{form.comment.length} / 500</div>
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
          <input type="checkbox" className="h-5 w-5 accent-grape" checked={form.isAnonymous}
            onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} />
          Anonymous (receiver can't see the sender)
        </label>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Tables ---------------- */

const th = 'px-4 py-3 text-left text-[13px] font-extrabold whitespace-nowrap';
const td = 'px-4 py-3 align-top text-[14px]';

function PersonCell({ person }) {
  if (!person) return <span className="text-ink-soft">Removed</span>;
  return (
    <div className="min-w-[140px]">
      <div className="font-bold leading-tight">{person.name}</div>
      <div className="text-xs text-ink-soft">{person.rollNo}</div>
    </div>
  );
}

function FeedbackTab({ onChanged }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return api
      .get('/admin/feedback', { params: { search: search || undefined, category: category || undefined, rating: rating || undefined } })
      .then((res) => setList(res.data.feedback))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, category, rating]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/feedback/${deleting._id}`);
      toast.success('Feedback deleted');
      setDeleting(null);
      load();
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[1fr_190px_150px]">
        <input type="search" className="field" placeholder="Search by student name or roll number"
          value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search feedback" />
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <select className="field" value={rating} onChange={(e) => setRating(e.target.value)} aria-label="Rating">
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : list.length === 0 ? (
        <p className="py-14 text-center font-semibold text-ink-soft">No feedback matches these filters.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[14px] border-2 border-ink bg-white">
          <table className="w-full min-w-[960px] border-collapse">
            <thead className="border-b-2 border-ink bg-desk">
              <tr>
                <th className={th}>From</th>
                <th className={th}>To</th>
                <th className={th}>Category</th>
                <th className={th}>Rating</th>
                <th className={th}>Comment</th>
                <th className={th}>Date</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((f) => (
                <tr key={f._id} className="border-b border-ink/15 last:border-b-0 hover:bg-desk/50">
                  <td className={td}>
                    <PersonCell person={f.givenBy} />
                    {f.isAnonymous && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">
                        <MaskIcon /> anonymous
                      </span>
                    )}
                  </td>
                  <td className={td}><PersonCell person={f.givenTo} /></td>
                  <td className={td}>
                    <span className={`chip whitespace-nowrap ${categoryMeta(f.category).bg}`}>{f.category}</span>
                  </td>
                  <td className={td}><StarRating value={f.rating} size={14} /></td>
                  <td className={`${td} max-w-[320px]`}><p className="line-clamp-3 leading-snug">{f.comment}</p></td>
                  <td className={`${td} whitespace-nowrap text-ink-soft`}>{formatDate(f.createdAt)}</td>
                  <td className={`${td} text-right`}>
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(f)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleting(f)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditFeedbackModal feedback={editing} onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); onChanged(); }} />

      <ConfirmModal open={!!deleting} title="Delete this feedback?" busy={busy}
        message={deleting ? `The note from ${deleting.givenBy?.name || 'a removed student'} to ${deleting.givenTo?.name || 'a removed student'} will be removed for good.` : ''}
        confirmLabel="Delete feedback" onConfirm={confirmDelete} onClose={() => setDeleting(null)} />
    </>
  );
}

function StudentsTab({ onChanged }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return api
      .get('/admin/students')
      .then((res) => setList(res.data.students))
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      const res = await api.delete(`/admin/students/${deleting._id}`);
      toast.success(res.data.message);
      setDeleting(null);
      load();
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const q = query.trim().toLowerCase();
  const shown = q ? list.filter((s) => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)) : list;

  return (
    <>
      <input type="search" className="field sm:max-w-sm" placeholder="Search by name or roll number"
        value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search students" />

      {loading ? (
        <Loader />
      ) : shown.length === 0 ? (
        <p className="py-14 text-center font-semibold text-ink-soft">No students found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-[14px] border-2 border-ink bg-white">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="border-b-2 border-ink bg-desk">
              <tr>
                <th className={th}>Student</th>
                <th className={th}>Department</th>
                <th className={th}>Contact</th>
                <th className={th}>Received</th>
                <th className={th}>Given</th>
                <th className={th}>Joined</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s._id} className="border-b border-ink/15 last:border-b-0 hover:bg-desk/50">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size="sm" />
                      <PersonCell person={s} />
                    </div>
                  </td>
                  <td className={td}>
                    <div className="font-semibold">{s.department}</div>
                    <div className="text-xs text-ink-soft">{yearLabel(s.year)}</div>
                  </td>
                  <td className={td}>
                    <div>{s.email}</div>
                    <div className="text-xs text-ink-soft">{s.phone}</div>
                  </td>
                  <td className={td}>
                    <div className="font-bold">{s.receivedCount}</div>
                    {s.receivedCount > 0 && <div className="text-xs text-ink-soft">avg {s.avgRating}</div>}
                  </td>
                  <td className={`${td} font-bold`}>{s.givenCount}</td>
                  <td className={`${td} whitespace-nowrap text-ink-soft`}>{formatDate(s.createdAt)}</td>
                  <td className={`${td} text-right`}>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleting(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal open={!!deleting} title={`Delete ${deleting?.name}?`} busy={busy}
        message="This removes the student's account and every note they gave or received. This can't be undone."
        confirmLabel="Delete student" onConfirm={confirmDelete} onClose={() => setDeleting(null)} />
    </>
  );
}

/* ---------------- Page ---------------- */

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('feedback');

  const loadStats = useCallback(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => toast.error(errorMessage(err)));
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (!stats) return <Loader label="Loading dashboard" />;

  const tabClass = (name) =>
    `rounded-full border-2 border-ink px-5 py-2 text-[15px] font-bold ${
      tab === name ? 'bg-ink text-white' : 'bg-white hover:bg-marker'}`;

  return (
    <div className="pt-8">
      <h1 className="text-4xl font-extrabold tracking-tight">
        <span className="marker-title">Admin dashboard</span>
      </h1>
      <p className="mt-2 text-ink-soft">Review every note, fix what needs fixing and remove what doesn't belong.</p>

      <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1.4fr]">
        <StatTile value={stats.totalStudents} label="students registered" />
        <StatTile value={stats.totalFeedback} label={`notes written, ${stats.anonymousCount} anonymous`} />
        <StatTile value={stats.avgRating || '–'} label="average rating" accent="bg-marker!" />
        <div className="lg:row-span-2">
          <TopRated students={stats.topStudents} />
        </div>
        <div className="lg:col-span-3">
          <CategoryBar byCategory={stats.byCategory} total={stats.totalFeedback} />
        </div>
      </div>

      <div className="mt-10 flex gap-2" role="tablist">
        <button role="tab" aria-selected={tab === 'feedback'} className={tabClass('feedback')} onClick={() => setTab('feedback')}>
          Feedback {stats.totalFeedback}
        </button>
        <button role="tab" aria-selected={tab === 'students'} className={tabClass('students')} onClick={() => setTab('students')}>
          Students {stats.totalStudents}
        </button>
      </div>

      <section className="mt-5">
        {tab === 'feedback' ? <FeedbackTab onChanged={loadStats} /> : <StudentsTab onChanged={loadStats} />}
      </section>
    </div>
  );
}
