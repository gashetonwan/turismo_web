import { useState } from 'react';
import api from '../api.js'; // <-- Importar la instancia
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/register', { email, password, role: 'USER' });
      setSuccess('Registro exitoso, ahora puedes iniciar sesión');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" className="border p-2 w-full" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" className="border p-2 w-full" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 w-full rounded">Registrarse</button>
      </form>
      <p className="mt-4 text-center">¿Ya tienes cuenta? <Link to="/login" className="text-blue-500">Inicia sesión</Link></p>
    </div>
  );
}
