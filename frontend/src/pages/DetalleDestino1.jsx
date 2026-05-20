import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function DetalleDestino() {
  const { id } = useParams();
  const [destino, setDestino] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios.get(`/api/destinos/${id}`)
      .then(res => setDestino(res.data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <div className="p-8 text-center">Cargando...</div>;
  if (!destino) return <div className="p-8 text-center">Destino no encontrado</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {destino.imagenUrl && <img src={destino.imagenUrl} alt={destino.nombre} className="w-full h-64 object-cover rounded mb-6" />}
      <h1 className="text-3xl font-bold">{destino.nombre}</h1>
      <p className="text-gray-600 text-lg">{destino.ubicacion}</p>
      <p className="text-green-600 font-bold text-2xl my-2">${destino.precioPorNoche} / noche</p>
      <p className="mt-4 text-gray-700">{destino.descripcion}</p>

      {/* Aquí luego agregaremos actividades y reseñas */}
      <h2 className="text-2xl font-semibold mt-8">Actividades</h2>
      <ul className="list-disc ml-6">
        {destino.actividades?.map(act => <li key={act.id}>{act.nombre}: {act.descripcion}</li>)}
        {(!destino.actividades || destino.actividades.length === 0) && <li>No hay actividades registradas.</li>}
      </ul>
    </div>
  );
}
