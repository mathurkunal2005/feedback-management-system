import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import StarRating from '../components/StarRating';
import { DEPARTMENTS, YEARS, yearLabel } from '../utils/constants';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');

  // Re-fetch when filters change (search waits 300ms after typing stops)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get('/students', { params: { search: search || undefined, department: department || undefined, year: year || undefined } })
        .then((res) => setStudents(res.data.students))
        .catch((err) => toast.error(errorMessage(err)))
        .finally(() => setLoading(false));
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, department, year]);

  const hasFilters = search || department || year;

  return (
    <div className="pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="marker-title">Your batchmates</span>
          </h1>
          <p className="mt-2 text-ink-soft">Pick someone you've worked with and leave them a note.</p>
        </div>
        {!loading && (
          <p className="text-sm font-bold text-ink-soft">
            {students.length} {students.length === 1 ? 'student' : 'students'}
          </p>
        )}
      </div>

      {/* filters */}
      <div className="panel mt-6 grid gap-3 p-4 sm:grid-cols-[1fr_180px_160px]">
        <div className="relative">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#5B5680" strokeWidth="2.5" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input type="search" className="field pl-10" placeholder="Search by name or roll number"
            value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search students" />
        </div>
        <select className="field" value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Department">
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="field" value={year} onChange={(e) => setYear(e.target.value)} aria-label="Year">
          <option value="">All years</option>
          {YEARS.map((y) => <option key={y} value={y}>{yearLabel(y)}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader label="Finding batchmates" />
      ) : students.length === 0 ? (
        <div className="mt-10 rounded-[18px] border-2 border-dashed border-ink/40 p-10 text-center">
          <p className="text-lg font-bold">No students match that.</p>
          <p className="mt-1 text-ink-soft">Try a different name, roll number or filter.</p>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm mt-4" onClick={() => { setSearch(''); setDepartment(''); setYear(''); }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <li key={s._id}>
              <Link to={`/students/${s._id}`}
                className="panel group flex h-full flex-col p-5 transition-transform hover:-translate-y-0.5 hover:shadow-hard-lg">
                <div className="flex items-center gap-3.5">
                  <Avatar name={s.name} />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-extrabold leading-tight group-hover:text-grape">{s.name}</h2>
                    <p className="text-sm font-semibold text-ink-soft">{s.rollNo}</p>
                  </div>
                </div>
                <div className="mb-5 mt-4 flex flex-wrap gap-1.5">
                  <span className="chip">{s.department}</span>
                  <span className="chip">{yearLabel(s.year)}</span>
                </div>
                <div className="mt-auto flex items-center justify-between border-t-2 border-ink/10 pt-3.5">
                  {s.feedbackCount ? (
                    <span className="flex items-center gap-2">
                      <StarRating value={s.avgRating} size={15} />
                      <span className="text-sm font-bold">{s.avgRating}</span>
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-ink-soft">No notes yet</span>
                  )}
                  <span className="text-sm font-semibold text-ink-soft">
                    {s.feedbackCount} {s.feedbackCount === 1 ? 'note' : 'notes'}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
