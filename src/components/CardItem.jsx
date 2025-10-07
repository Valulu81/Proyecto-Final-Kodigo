//ESTA ES LA TARJETA EN SÍ, RECIBE LOS DATOS Y LOS RENDERIZA EN LAS CARDS DENTRO DE LOS TABLEROS

export default function CardItem({ card, onEdit, onDelete }) {
  //DESESTRUCTURADO OBJETO CON LA INFO DE LA CARD
  const { title, assignedTo, status, priority, dueDate } = card;

  // Colores de prioridad
  const priorityColors = {
    Alta: "bg-red-500 text-white",
    Media: "bg-yellow-400 text-black",
    Baja: "bg-green-500 text-white",
  };

  return (
    <div
      onClick={() => onEdit(card)}
      className="relative rounded-xl bg-white p-3 shadow cursor-pointer hover:shadow-md transition"
    >
      {/* BOTÓN PARA BORRAR LA CARD, AQUÍ PODRÍA EJECUTARSE UN MÉTODO PARA ELIMINARLA DE LA DB */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // evita que dispare el onClick de editar

          //ESTE MÉTODO LA BORRA, VERLO EN Kanban.jsx
          onDelete?.(card.id);
        }}
        className="absolute top-0 right-2 text-red-500 hover:text-red-700 font-bold"
        title="Eliminar tarjeta"
      >
        ✕
      </button>

      {/* DATOS DE LA TARJETA RENDERIZADOS */}

      {/* Título */}
      <h4 className="text-center font-semibold mb-2">
        {title || "Sin título"}
      </h4>

      {/* Usuario asignado */}
      {assignedTo && (
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Asignado a:</span> {assignedTo}
        </p>
      )}

      {/* Estado */}
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Estado:</span> {status || "Pendiente"}
      </p>

      {/* Prioridad */}
      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
        <span className="font-medium">Prioridad:</span>
        <span
          className={`px-2 py-[2px] rounded-full text-xs font-semibold ${
            priorityColors[priority] || "bg-gray-300 text-black"
          }`}
        >
          {priority || "Media"}
        </span>
      </p>

      {/* Fecha límite */}
      {dueDate && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">Fecha límite:</span>{" "}
          {new Date(dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
