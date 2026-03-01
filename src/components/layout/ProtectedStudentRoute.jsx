import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function ProtectedStudentRoute({ children }) {
  const { studentAuthenticated } = useApp();

  if (!studentAuthenticated) {
    return <Navigate to="/student/login" replace />;
  }

  return children;
}
