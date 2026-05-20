import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/admin'); // redirigir al panel si es admin, o a inicio
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" className="border p-2 w-full" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" className="border p-2 w-full" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full rounded">Entrar</button>
      </form>
      <p className="mt-4 text-center">¿No tienes cuenta? <Link to="/register" className="text-blue-500">Regístrate</Link></p>
    </div>
  );
}
