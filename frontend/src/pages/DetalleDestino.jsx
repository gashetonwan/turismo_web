import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api.js";

function DetalleDestino() {
  const { id } = useParams();
  const [destino, setDestino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/api/destinos/${id}`)
      .then((res) => setDestino(res.data))
      .catch(() => setError("No se encontró el destino."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Cargando destino...</div>
    );
  }

  if (error || !destino) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error || "Destino no encontrado."}</p>
        <Link to="/" className="text-blue-500 underline">
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        to="/"
        className="text-blue-500 hover:underline text-sm mb-4 inline-block"
      >
        ← Volver al inicio
      </Link>

      {destino.imagenUrl ? (
        <img
          src={destino.imagenUrl}
          alt={destino.nombre}
          className="w-full h-64 object-cover rounded-xl mb-6"
          onError={(e) => {
            e.target.src =
              "https://picsum.photos/seed/" + destino.id + "/800/600";
            e.target.onerror = null;
          }}
        />
      ) : (
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-6xl mb-6 rounded-xl">
          🗺️
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold">{destino.nombre}</h1>
        {destino.destacado && (
          <span className="bg-yellow-200 text-yellow-800 text-sm px-3 py-1 rounded-full">
            ⭐ Destacado
          </span>
        )}
      </div>

      {destino.ubicacion && (
        <p className="text-gray-500 mb-2">📍 {destino.ubicacion}</p>
      )}

      {destino.precioPorNoche && (
        <p className="text-green-600 font-bold text-xl mb-4">
          ${destino.precioPorNoche} / noche
        </p>
      )}

      {destino.descripcion && (
        <p className="text-gray-700 leading-relaxed">{destino.descripcion}</p>
      )}
    </div>
  );
}

export default DetalleDestino;
