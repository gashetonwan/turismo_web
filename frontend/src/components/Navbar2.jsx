import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 rounded transition-colors ${pathname === path
      ? 'bg-blue-600 text-white'
      : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white border-b shadow-sm px-8 py-3 flex items-center gap-4">
      <span className="text-xl font-bold mr-6">🌍 TurismoApp</span>
      <Link to="/" className={linkClass('/')}>
        Inicio
      </Link>
      <Link to="/admin" className={linkClass('/admin')}>
        Admin
      </Link>
    </nav>
  );
}

export default Navbar;

