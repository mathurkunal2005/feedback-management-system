import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/axios';
import Logo from '../components/Logo';
import { DEPARTMENTS, YEARS, yearLabel } from '../utils/constants';

const EMPTY = { name: '', email: '', rollNo: '', department: '', year: '', phone: '', password: '', confirm: '' };

// Same rules as the backend, so users see errors instantly
const validate = (f) => {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email';
  if (!/^\d{2}B[A-Z]{2}\d{4}$/.test(f.rollNo.trim().toUpperCase())) e.rollNo = 'Format: 23BCS1042';
  if (!f.department) e.department = 'Choose your department';
  if (!f.year) e.year = 'Choose your year';
  if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = 'Enter a 10-digit mobile number';
  if (f.password.length < 6) e.password = 'At least 6 characters';
  if (f.confirm !== f.password) e.confirm = "Passwords don't match";
  return e;
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const { confirm, ...data } = form;
      const user = await register({
        ...data,
        name: data.name.trim(),
        email: data.email.trim(),
        rollNo: data.rollNo.trim().toUpperCase(),
        phone: data.phone.trim(),
        year: Number(data.year),
      });
      toast.success(`Account created. Welcome, ${user.name.split(' ')[0]}`);
      navigate('/students', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder, autoComplete }) => (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <input id={name} name={name} type={type} placeholder={placeholder} autoComplete={autoComplete}
        className="field" value={form[name]} onChange={onChange} aria-invalid={!!errors[name]} />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl py-10">
      <Link to="/login" aria-label="Back to login">
        <Logo size="lg" />
      </Link>

      <form onSubmit={onSubmit} className="panel mt-8 p-7 sm:p-9" noValidate>
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight">
          <span className="marker-title">Join your batch</span>
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Once you sign up, you'll show up in the batchmates list and others can leave you notes.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {Field({ name: 'name', label: 'Full name', placeholder: 'Aarav Sharma', autoComplete: 'name' })}
          </div>
          {Field({ name: 'email', label: 'College email', type: 'email', placeholder: 'aarav.sharma@student.college.edu', autoComplete: 'email' })}
          {Field({ name: 'rollNo', label: 'Roll number', placeholder: '23BCS1042' })}

          <div>
            <label htmlFor="department" className="field-label">Department</label>
            <select id="department" name="department" className="field" value={form.department} onChange={onChange}>
              <option value="">Select</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.department && <p className="field-error">{errors.department}</p>}
          </div>
          <div>
            <label htmlFor="year" className="field-label">Year</label>
            <select id="year" name="year" className="field" value={form.year} onChange={onChange}>
              <option value="">Select</option>
              {YEARS.map((y) => <option key={y} value={y}>{yearLabel(y)}</option>)}
            </select>
            {errors.year && <p className="field-error">{errors.year}</p>}
          </div>

          <div className="sm:col-span-2">
            {Field({ name: 'phone', label: 'Mobile number', type: 'tel', placeholder: '98XXXXXXXX', autoComplete: 'tel' })}
          </div>
          {Field({ name: 'password', label: 'Password', type: 'password', placeholder: 'At least 6 characters', autoComplete: 'new-password' })}
          {Field({ name: 'confirm', label: 'Confirm password', type: 'password', placeholder: 'Type it again', autoComplete: 'new-password' })}
        </div>

        <div className="mt-8 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-[15px]">
            Already registered?{' '}
            <Link to="/login" className="font-bold underline decoration-2 underline-offset-2 hover:text-grape">Log in</Link>
          </p>
          <button type="submit" className="btn btn-primary w-full px-8 py-3 sm:w-auto" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}
