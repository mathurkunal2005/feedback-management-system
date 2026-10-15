import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Logo from './Logo';

const STUDENT_LINKS = [
  { to: '/students', label: 'Batchmates' },
  { to: '/received', label: 'Notes for me' },
  { to: '/given', label: 'Notes I wrote' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user.role === 'admin' ? [{ to: '/admin', label: 'Dashboard' }] : STUDENT_LINKS;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap rounded-full border-2 px-4 py-1.5 text-[15px] font-bold transition-colors ${
      isActive ? 'border-ink bg-marker shadow-hard-sm' : 'border-transparent hover:border-ink/30'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-desk/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" aria-label="BatchNotes home">
          <Logo />
        </NavLink>

        <nav className="hidden flex-1 justify-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/students'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2.5 sm:flex">
            <Avatar name={user.name} size="sm" />
            <div className="leading-tight">
              <div className="text-sm font-bold">{user.name}</div>
              <div className="text-xs text-ink-soft">{user.role === 'admin' ? 'Administrator' : user.rollNo}</div>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm">
            Log out
          </button>
        </div>
      </div>

      {/* mobile nav strip */}
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-3 md:hidden">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/students'} className={linkClass}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
