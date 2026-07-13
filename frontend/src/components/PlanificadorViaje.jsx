import { useState } from "react";

const PlanificadorViaje = () => {
  // Opciones disponibles
  const opciones = {
    vehiculo: [
      { id: "eco", nombre: "Auto económico", precio: 30 },
      { id: "estandar", nombre: "Auto estándar", precio: 50 },
      { id: "premium", nombre: "Auto premium", precio: 80 },
    ],
    hotel: [
      { id: "hostal", nombre: "Hostal", precio: 25 },
      { id: "3estrellas", nombre: "Hotel 3 estrellas", precio: 50 },
      { id: "5estrellas", nombre: "Hotel 5 estrellas", precio: 100 },
    ],
    recorrido: [
      { id: "machu", nombre: "Machu Picchu", precio: 80 },
      { id: "7colores", nombre: "Montaña 7 colores", precio: 60 },
      { id: "mihouse", nombre: "Mi House", precio: 40 },
    ],
  };

  // Estados para selecciones (guardamos el id)
  const [seleccion, setSeleccion] = useState({
    vehiculo: opciones.vehiculo[0].id,
    hotel: opciones.hotel[0].id,
    recorrido: opciones.recorrido[0].id,
  });

  // Función para obtener el precio de un item por id
  const obtenerPrecio = (categoria, id) => {
    const item = opciones[categoria].find((opt) => opt.id === id);
    return item ? item.precio : 0;
  };

  // Calcular total
  const total =
    obtenerPrecio("vehiculo", seleccion.vehiculo) +
    obtenerPrecio("hotel", seleccion.hotel) +
    obtenerPrecio("recorrido", seleccion.recorrido);

  // Manejar cambio de selección
  const handleChange = (categoria, id) => {
    setSeleccion((prev) => ({ ...prev, [categoria]: id }));
  };

  // Renderizar opciones para una categoría
  const renderOpciones = (categoria, titulo) => {
    return (
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">{titulo}</h3>
        <div className="flex flex-wrap gap-3">
          {opciones[categoria].map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition"
            >
              <input
                type="radio"
                name={categoria}
                value={opt.id}
                checked={seleccion[categoria] === opt.id}
                onChange={() => handleChange(categoria, opt.id)}
                className="accent-blue-600"
              />
              <span>{opt.nombre}</span>
              <span className="text-green-600 font-bold">${opt.precio}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-10 p-6 border rounded-xl shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-4">Programa tu propio recorrido</h2>
      <p className="text-gray-600 mb-6">
        Selecciona las opciones que mejor se adapten a tu viaje
      </p>

      {renderOpciones("vehiculo", "🚗 Vehículo")}
      {renderOpciones("hotel", "🏨 Hotel")}
      {renderOpciones("recorrido", "🗺️ Recorrido")}

      <div className="mt-6 pt-4 border-t border-gray-300 flex justify-between items-center">
        <span className="text-xl font-bold">Total:</span>
        <span className="text-2xl font-bold text-green-600">${total}</span>
      </div>
    </div>
  );
};

export default PlanificadorViaje;
