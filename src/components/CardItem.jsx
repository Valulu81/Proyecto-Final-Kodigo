import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog"; // Asegúrate de la ruta correcta

export default function CardItem({ card, onEdit, onDelete }) {
  const { title, assignedTo, status, priority, dueDate } = card;

  const [showConfirm, setShowConfirm] = useState(false); // controla el diálogo

  const p = String(priority || "media").toLowerCase();
  const label = p.charAt(0).toUpperCase() + p.slice(1);
  const priorityColors = {
    alta: "bg-red-500 text-white",
    media: "bg-yellow-400 text-black",
    baja: "bg-green-500 text-white",
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // evita abrir el editor
    setShowConfirm(true); // muestra el diálogo
  };

  const handleConfirmDelete = () => {
    onDelete?.(card.id); // ejecuta la eliminación real
    setShowConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <div
        onClick={() => onEdit(card)}
        className="relative rounded-xl bg-white p-3 shadow cursor-pointer hover:shadow-md transition"
      >
        {/* BOTÓN PARA BORRAR LA CARD */}
        <button
          onClick={handleDeleteClick}
          className="absolute top-0 right-2 text-red-500 hover:text-red-700 font-bold"
          title="Eliminar tarjeta"
        >
          ✕
        </button>

        {/* DATOS DE LA TARJETA */}
        <h4 className="text-center font-semibold mb-2">
          {title || "Sin título"}
        </h4>

        {assignedTo && (
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Asignado a:</span> {assignedTo}
          </p>
        )}

        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Estado:</span> {status || "Pendiente"}
        </p>

        <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
          <span className="font-medium">Prioridad:</span>
          <span
            className={`px-2 py-[2px] rounded-full text-xs font-semibold ${
              priorityColors[p] || "bg-gray-300 text-black"
            }`}
          >
            {label}
          </span>
        </p>

        {dueDate && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Fecha límite:</span>{" "}
            {new Date(dueDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* CONFIRM DIALOG */}
      <ConfirmDialog
        open={showConfirm}
        title="¿Eliminar tarjeta?"
        description={`¿Seguro que deseas eliminar la tarjeta "${title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        tone="danger"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
