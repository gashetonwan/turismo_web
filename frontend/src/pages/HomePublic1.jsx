import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function HomePublic() {
  const [destinos, setDestinos] = useState([]);

  useEffect(() => {
    axios.get('/api/destinos').then(res => setDestinos(res.data));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">🌍 Descubre tu próximo destino</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {destinos.map(d => (
          <div key={d.id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
            {d.imagenUrl && <img src={d.imagenUrl} alt={d.nombre} className="w-full h-48 object-cover" />}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{d.nombre}</h2>
              <p className="text-gray-600">{d.ubicacion}</p>
              <p className="text-green-600 font-bold">${d.precioPorNoche}/noche</p>
              <Link to={`/destino/${d.id}`} className="inline-block mt-3 bg-blue-500 text-white px-4 py-2 rounded text-sm">Ver más</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
