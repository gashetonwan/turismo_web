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

      <a
        href="https://wa.me/51959243835?text=Hola..."
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all transform hover:scale-110 z-50 flex items-center justify-center"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" className="w-8 h-8" />
      </a>
    </nav>
  );
}
