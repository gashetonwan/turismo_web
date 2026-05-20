
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function HomePublic() {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/destinos')
      .then((res) => setDestinos(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando destinos...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Destinos Turísticos</h1>
      <p className="text-gray-500 mb-8">Explora los mejores lugares para visitar</p>

      {destinos.length === 0 ? (
        <p className="text-gray-400 text-center mt-16">No hay destinos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinos.map((d) => (
            <Link
              key={d.id}
              to={`/destino/${d.id}`}
              className="border rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow group"
            >
              {d.imagenUrl ? (
                <img
                  src={d.imagenUrl}
                  alt={d.nombre}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-4xl">🗺️</div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold">{d.nombre}</h2>
                  {d.destacado && (
                    <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded">
                      ⭐ Destacado
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-2">{d.ubicacion}</p>
                <p className="text-green-600 font-bold">${d.precioPorNoche}/noche</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePublic;
