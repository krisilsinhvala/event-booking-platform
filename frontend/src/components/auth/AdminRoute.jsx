import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('eventoraUser') || '{}');
  const token = localStorage.getItem('eventoraToken');

  if (!token) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}

export default AdminRoute;
