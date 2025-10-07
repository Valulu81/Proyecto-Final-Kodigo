// ESTE ES EL MODAL QUE SALE AL DARLE CLICK A UNA TARJETA, PIDE LOS DATOS Y CREA LA TARJETA

import { useEffect, useRef, useState } from "react";

export default function ModalCard({
  open,
  defaultValue = "",
  assignedTo = "",
  status = "Pendiente",
  priority = "Media",
  dueDate = "",
  editMode = false,
  onCreate,
  onUpdate,
  onClose,
  cardId = null,
}) {
  const [titleState, setTitleState] = useState(defaultValue);
  const [assignedToState, setAssignedToState] = useState(assignedTo);
  const [statusState, setStatusState] = useState(status);
  const [priorityState, setPriorityState] = useState(priority);
  const [dueDateState, setDueDateState] = useState(dueDate);

  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTitleState(defaultValue);
      setAssignedToState(assignedTo);
      setStatusState(status);
      setPriorityState(priority);
      setDueDateState(dueDate);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, defaultValue, assignedTo, status, priority, dueDate]);

  if (!open) return null;

  const handleSubmit = () => {
    const data = {
      title: titleState,
      assignedTo: assignedToState,
      status: statusState,
      priority: priorityState,
      dueDate: dueDateState,
    };

    if (editMode) onUpdate?.(cardId, data);
    else onCreate?.(data);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="w-[520px] rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">
          {editMode ? "Editar tarjeta" : "Nueva tarjeta"}
        </h2>

        <label className="mb-1 block text-sm">Título</label>
        <input
          ref={inputRef}
          value={titleState}
          onChange={(e) => setTitleState(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onClose();
          }}
          className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring"
          placeholder="Escribe un título"
        />

        <label className="mb-1 block text-sm">Usuario asignado</label>
        <input
          value={assignedToState}
          onChange={(e) => setAssignedToState(e.target.value)}
          className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring"
          placeholder="Nombre del usuario"
        />

        <label className="mb-1 block text-sm">Estado</label>
        <select
          value={statusState}
          onChange={(e) => setStatusState(e.target.value)}
          className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring"
        >
          <option>Pendiente</option>
          <option>En progreso</option>
          <option>Completado</option>
        </select>

        <label className="mb-1 block text-sm">Prioridad</label>
        <select
          value={priorityState}
          onChange={(e) => setPriorityState(e.target.value)}
          className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring"
        >
          <option>Baja</option>
          <option>Media</option>
          <option>Alta</option>
        </select>

        <label className="mb-1 block text-sm">Fecha límite</label>
        <input
          type="date"
          value={dueDateState}
          onChange={(e) => setDueDateState(e.target.value)}
          className="mb-6 w-full rounded-md border px-3 py-2 outline-none focus:ring"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 hover:bg-stone-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-md bg-base-dark px-4 py-2 text-white hover:opacity-90"
          >
            {editMode ? "Guardar cambios" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
