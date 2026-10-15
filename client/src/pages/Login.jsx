import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/axios';
import { homeFor } from '../App';
import Logo from '../components/Logo';
import StarRating from '../components/StarRating';

// Example notes pinned on the login board (just for looks)
const SAMPLE_NOTES = [
  { bg: 'bg-note-sky', cat: 'Technical Skills', rating: 5, text: 'Explained segment trees to me in ten minutes. Legend.', tilt: -4, pos: 'left-0 top-6' },
  { bg: 'bg-note-mint', cat: 'Teamwork', rating: 4, text: 'Took the boring documentation part without being asked.', tilt: 3, pos: 'right-2 top-0' },
  { bg: 'bg-note-peach', cat: 'Punctuality', rating: 3, text: 'Great ideas, but please reply on the group chat before midnight.', tilt: -2, pos: 'left-10 top-[190px]' },
];

const DEMO = [
  { label: 'Student', email: 'aarav.sharma@student.college.edu', password: 'student123' },
  { label: 'Admin', email: 'admin@college.edu', password: 'admin123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Enter your email and password');
      return;
    }
    setBusy(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(homeFor(user), { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      {/* Left: the board */}
      <section className="hidden lg:block">
        <Logo size="lg" />
        <h1 className="mt-8 max-w-md text-[52px] font-extrabold leading-[1.02] tracking-tight">
          Leave a note for your batchmates.
        </h1>
        <p className="mt-4 max-w-sm text-lg leading-relaxed text-ink-soft">
          Honest feedback on skills, teamwork and more, from the people who actually work with you.
        </p>

        <div className="relative mt-10 h-[330px] max-w-lg">
          {SAMPLE_NOTES.map((n) => (
            <div
              key={n.cat}
              className={`note note-pin absolute w-64 ${n.bg} ${n.pos}`}
              style={{ '--tilt': `${n.tilt}deg` }}
              aria-hidden="true"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[13px] font-extrabold">{n.cat}</span>
                <StarRating value={n.rating} size={13} />
              </div>
              <p className="font-hand text-[22px] leading-[1.15]">{n.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Right: the form */}
      <section className="mx-auto w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Logo size="lg" />
          <p className="mt-3 text-ink-soft">Leave a note for your batchmates.</p>
        </div>

        <form onSubmit={onSubmit} className="panel p-7 sm:p-8" noValidate>
          <h2 className="text-2xl font-extrabold">Log in</h2>
          <p className="mt-1 text-[15px] text-ink-soft">Use your college email.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" className="field"
                placeholder="you@student.college.edu" value={form.email} onChange={onChange} />
            </div>
            <div>
              <label htmlFor="password" className="field-label">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" className="field"
                placeholder="••••••" value={form.password} onChange={onChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-6 w-full py-3" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>

          <p className="mt-5 text-center text-[15px]">
            New here?{' '}
            <Link to="/register" className="font-bold underline decoration-2 underline-offset-2 hover:text-grape">
              Create an account
            </Link>
          </p>
        </form>

        <div className="mt-5 rounded-[14px] border-2 border-dashed border-ink/40 p-4">
          <p className="text-sm font-bold">Try a demo account</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {DEMO.map((d) => (
              <button key={d.label} type="button" className="btn btn-marker btn-sm"
                onClick={() => setForm({ email: d.email, password: d.password })}>
                Fill {d.label.toLowerCase()} login
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
