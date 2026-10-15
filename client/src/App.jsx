import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import Login from './pages/Login';
import Register from './pages/Register';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Received from './pages/Received';
import Given from './pages/Given';
import AdminDashboard from './pages/AdminDashboard';

// Sends each user to their own home page
export const homeFor = (user) => (user?.role === 'admin' ? '/admin' : '/students');

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return <Navigate to={user ? homeFor(user) : '/login'} replace />;
}

// Login/Register pages: if already logged in, skip them
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? <Navigate to={homeFor(user)} replace /> : children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

          <Route path="/students" element={<ProtectedRoute role="student"><Students /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
          <Route path="/received" element={<ProtectedRoute role="student"><Received /></ProtectedRoute>} />
          <Route path="/given" element={<ProtectedRoute role="student"><Given /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </main>
    </>
  );
}
