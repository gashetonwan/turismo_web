import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

function HomePublic() {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el planificador
  const [vehiculo, setVehiculo] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [recorrido, setRecorrido] = useState(null);

  // Datos de opciones (precios en soles)
  const opcionesVehiculo = [
    { id: "auto", nombre: "Auto", precio: 50 },
    { id: "van", nombre: "Van", precio: 80 },
    { id: "bus", nombre: "Bus", precio: 120 },
  ];
  const opcionesHotel = [
    { id: "hostal", nombre: "Hostal", precio: 60 },
    { id: "hotel3", nombre: "Hotel 3★", precio: 120 },
    { id: "hotel5", nombre: "Hotel 5★", precio: 250 },
  ];
  const opcionesRecorrido = [
    { id: "machu", nombre: "Machu Picchu", precio: 200 },
    { id: "montana", nombre: "Montaña 7 Colores", precio: 150 },
    { id: "mihouse", nombre: "Mi House", precio: 100 },
  ];

  // Cálculo del total
  const calcularTotal = () => {
    const precioVehiculo = vehiculo ? vehiculo.precio : 0;
    const precioHotel = hotel ? hotel.precio : 0;
    const precioRecorrido = recorrido ? recorrido.precio : 0;
    return precioVehiculo + precioHotel + precioRecorrido;
  };

  const total = calcularTotal();

  useEffect(() => {
    api
      .get("/api/destinos")
      .then((res) => setDestinos(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Cargando destinos...</div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Sección de destinos existente */}
      <h1 className="text-3xl font-bold mb-2">Destinos Turísticos</h1>
      <p className="text-gray-500 mb-8">
        Explora los mejores lugares para visitar
      </p>

      {destinos.length === 0 ? (
        <p className="text-gray-400 text-center mt-16">
          No hay destinos disponibles.
        </p>
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
                  onError={(e) => {
                    e.target.src =
                      "https://picsum.photos/seed/" + d.id + "/800/600";
                    e.target.onerror = null;
                  }}
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-4xl">
                  🗺️
                </div>
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
                <p className="text-green-600 font-bold">
                  ${d.precioPorNoche}/noche
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* === NUEVA SECCIÓN: PLANIFICADOR DE RECORRIDO === */}
      <section className="mt-16 p-6 bg-amber-50 rounded-2xl shadow-lg border border-amber-200">
        <h2 className="text-3xl font-bold text-orange-800 mb-2 text-center">
          🗺️ Programa tu propio recorrido
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Elige tu vehículo, hospedaje y recorrido favorito. ¡Personaliza tu
          experiencia!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna: Vehículo */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-3 text-center">
              🚗 Vehículo
            </h3>
            <div className="space-y-2">
              {opcionesVehiculo.map((op) => (
                <div
                  key={op.id}
                  onClick={() =>
                    setVehiculo(vehiculo?.id === op.id ? null : op)
                  }
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    vehiculo?.id === op.id
                      ? "border-orange-500 bg-orange-100 shadow-md"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{op.nombre}</span>
                    <span className="text-orange-600 font-bold">
                      S/{op.precio}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna: Hotel */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-3 text-center">
              🏨 Hotel
            </h3>
            <div className="space-y-2">
              {opcionesHotel.map((op) => (
                <div
                  key={op.id}
                  onClick={() => setHotel(hotel?.id === op.id ? null : op)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    hotel?.id === op.id
                      ? "border-orange-500 bg-orange-100 shadow-md"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{op.nombre}</span>
                    <span className="text-orange-600 font-bold">
                      S/{op.precio}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna: Recorrido */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-3 text-center">
              ⛰️ Recorrido
            </h3>
            <div className="space-y-2">
              {opcionesRecorrido.map((op) => (
                <div
                  key={op.id}
                  onClick={() =>
                    setRecorrido(recorrido?.id === op.id ? null : op)
                  }
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    recorrido?.id === op.id
                      ? "border-orange-500 bg-orange-100 shadow-md"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{op.nombre}</span>
                    <span className="text-orange-600 font-bold">
                      S/{op.precio}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen y total */}
        <div className="mt-8 p-4 bg-white rounded-xl shadow-inner border border-amber-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-gray-500">Resumen de tu selección:</p>
              <div className="flex gap-4 flex-wrap mt-1">
                <span className="text-sm">
                  🚗 {vehiculo ? vehiculo.nombre : "No seleccionado"}
                </span>
                <span className="text-sm">
                  🏨 {hotel ? hotel.nombre : "No seleccionado"}
                </span>
                <span className="text-sm">
                  ⛰️ {recorrido ? recorrido.nombre : "No seleccionado"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Precio total</p>
              <p className="text-2xl font-bold text-orange-700">
                S/{total > 0 ? total : "—"}
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              className={`px-8 py-2 rounded-full font-semibold transition-all ${
                total > 0
                  ? "bg-orange-600 text-white hover:bg-orange-700 shadow-md"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={total === 0}
              onClick={() => alert("¡Gracias por tu reserva! (Demo)")}
            >
              {total > 0 ? "Reservar ahora" : "Selecciona opciones"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePublic;
