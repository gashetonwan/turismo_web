import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4 flex gap-6 justify-between">
      <div className="flex gap-6">
        <Link to="/" className="hover:underline">Inicio</Link>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="hover:underline">Administrar destinos</Link>
        )}
      </div>
      <div className="flex gap-6">
        {user ? (
          <>
            <span className="text-sm">{user.email}</span>
            <button onClick={logout} className="hover:underline">Cerrar sesión</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Iniciar sesión</Link>
            <Link to="/register" className="hover:underline">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
