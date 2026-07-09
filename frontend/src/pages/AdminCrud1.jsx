import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api.js'; // <-- Importar la instancia

function AdminCrud() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [destinos, setDestinos] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre: '',
    ubicacion: '',
    precioPorNoche: '',
    descripcion: '',
    imagenUrl: '',
    destacado: false,
  });
  const [editando, setEditando] = useState(false);
  const [imagenFile, setImagenFile] = useState(null);

  // Configurar axios con token
  const axiosAuth = api.create();
  axiosAuth.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Si no es admin, redirigir
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (user?.role !== 'ADMIN') {
      navigate('/');
    } else {
      fetchDestinos();
    }
  }, [token, user]);

  const fetchDestinos = async () => {
    const res = await api.get('/api/destinos'); // pública
    setDestinos(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('ubicacion', form.ubicacion);
    formData.append('precioPorNoche', form.precioPorNoche);
    formData.append('descripcion', form.descripcion);
    formData.append('destacado', form.destacado);
    if (imagenFile) formData.append('imagen', imagenFile);

    try {
      if (editando) {
        await axiosAuth.put(`/api/destinos/${form.id}`, formData);
      } else {
        await axiosAuth.post('/api/destinos', formData);
      }
      resetForm();
      fetchDestinos();
    } catch (err) {
      console.error(err);
      alert('Error al guardar');
    }
  };

  const handleEdit = (destino) => {
    setForm({
      id: destino.id,
      nombre: destino.nombre,
      ubicacion: destino.ubicacion || '',
      precioPorNoche: destino.precioPorNoche || '',
      descripcion: destino.descripcion || '',
      imagenUrl: destino.imagenUrl || '',
      destacado: destino.destacado || false,
    });
    setEditando(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este destino?')) {
      await axiosAuth.delete(`/api/destinos/${id}`);
      fetchDestinos();
    }
  };

  const resetForm = () => {
    setForm({ id: null, nombre: '', ubicacion: '', precioPorNoche: '', descripcion: '', imagenUrl: '', destacado: false });
    setEditando(false);
    setImagenFile(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">⚙️ Panel de Administración</h1>

      {/* Formulario de creación/edición */}
      <form onSubmit={handleSubmit} className="mb-8 border p-4 rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">{editando ? 'Editar Destino' : 'Nuevo Destino'}</h2>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="Ubicación"
          value={form.ubicacion}
          onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
        />
        <input
          className="border p-2 w-full mb-2"
          type="number"
          step="0.01"
          placeholder="Precio por noche"
          value={form.precioPorNoche}
          onChange={(e) => setForm({ ...form, precioPorNoche: parseFloat(e.target.value) })}
        />
        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        <input
          className="border p-2 w-full mb-2"
          type="file"
          accept="image/*"
          onChange={(e) => setImagenFile(e.target.files[0])}
        />
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={form.destacado}
            onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
            className="mr-2"
          />
          Destacado
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editando ? 'Actualizar' : 'Crear'}
          </button>
          {editando && (
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de destinos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {destinos.map((d) => (
          <div key={d.id} className="border rounded p-4 shadow">
            {d.imagenUrl && (
              <img src={d.imagenUrl} alt={d.nombre} className="w-full h-32 object-cover mb-2 rounded" />
            )}
            <h2 className="text-xl font-semibold">{d.nombre}</h2>
            <p className="text-gray-600">{d.ubicacion}</p>
            <p className="text-green-600 font-bold">${d.precioPorNoche}/noche</p>
            <p className="text-sm">{d.descripcion}</p>
            {d.destacado && (
              <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded mt-2">
                Destacado
              </span>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleEdit(d)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                Editar
              </button>
              <button onClick={() => handleDelete(d.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminCrud;
