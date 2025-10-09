import { useEffect, useRef, useState } from "react";

import { API_BASE } from "../config/api.js";

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
  colId = null,
}) {
  const [titleState, setTitleState] = useState(defaultValue);
  const [assignedToState, setAssignedToState] = useState(assignedTo);
  const [statusState, setStatusState] = useState(status);
  const [priorityState, setPriorityState] = useState(priority);
  const [dueDateState, setDueDateState] = useState(dueDate);
  const [loading, setLoading] = useState(false);

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

  // ✅ Crear tarea en la API
  const createTaskInAPI = async (cardData) => {
    if (!colId) {
      console.error("No se proporcionó colId para crear la tarea");
      return null;
    }

    try {
      const payload = {
        columna_id: colId,
        nombre: cardData.title,
        descripcion: cardData.title, // Usar título como descripción por ahora
        usuario_asignado: cardData.assignedTo,
        estado: cardData.status,
        prioridad: cardData.priority.toLowerCase(),
        fecha_limite: cardData.dueDate || null,
        posicion: 0,
        avance: cardData.status === "Completado" ? 100 : 0
      };

      console.log("Creando tarea con payload:", payload);

      const res = await fetch(`${API_BASE}/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const newTask = await res.json();
      console.log("Tarea creada:", newTask);
      return newTask;

    } catch (err) {
      console.error("Error creando tarea:", err);
      return null;
    }
  };

  // ✅ Actualizar tarea en la API
  const updateTaskInAPI = async (taskId, cardData) => {
    try {
      const payload = {
        nombre: cardData.title,
        descripcion: cardData.title,
        usuario_asignado: cardData.assignedTo,
        estado: cardData.status,
        prioridad: cardData.priority.toLowerCase(),
        fecha_limite: cardData.dueDate || null,
        avance: cardData.status === "Completado" ? 100 : 0
      };

      console.log("Actualizando tarea:", taskId, "con payload:", payload);

      const res = await fetch(`${API_BASE}/tareas/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const updatedTask = await res.json();
      console.log("Tarea actualizada:", updatedTask);
      return updatedTask;

    } catch (err) {
      console.error("Error actualizando tarea:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!titleState.trim()) {
      alert("El título es obligatorio");
      return;
    }
  console.log("[ModalCard] submit", { editMode, cardId, colId })
    setLoading(true);

    const data = {
      title: titleState.trim(),
      assignedTo: assignedToState.trim(),
      status: statusState,
      priority: priorityState,
      dueDate: dueDateState,
    };

    try {
      if (editMode && cardId) {
        // Modo edición
        const updatedTask = await updateTaskInAPI(cardId, data);
        if (updatedTask) {
          onUpdate?.(cardId, data);
        } else {
          alert("Error al actualizar la tarea");
        }
      } else {
        // Modo creación
        const newTask = await createTaskInAPI(data);
        if (newTask) {
          // Pasar los datos completos de la tarea creada
          onCreate?.({
            ...data,
            id: newTask.id,
            createdAt: newTask.created_at || new Date().toISOString(),
          });
        } else {
          alert("Error al crear la tarea");
        }
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      alert("Error al procesar la tarea");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="w-[520px] rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">
          {editMode ? "Editar tarea" : "Nueva tarea"}
        </h2>

        <label className="mb-1 block text-sm font-medium">Título *</label>
        <input
          ref={inputRef}
          value={titleState}
          onChange={(e) => setTitleState(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escribe un título"
          disabled={loading}
        />

        <label className="mb-1 block text-sm font-medium">Usuario asignado</label>
        <input
          value={assignedToState}
          onChange={(e) => setAssignedToState(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nombre del usuario"
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Estado</label>
            <select
              value={statusState}
              onChange={(e) => setStatusState(e.target.value)}
              className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completado</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Prioridad</label>
            <select
              value={priorityState}
              onChange={(e) => setPriorityState(e.target.value)}
              className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>

        <label className="mb-1 block text-sm font-medium">Fecha límite</label>
        <input
          type="date"
          value={dueDateState}
          onChange={(e) => setDueDateState(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-6 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !titleState.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Procesando..." : (editMode ? "Guardar cambios" : "Crear")}
          </button>
        </div>
      </div>
    </div>
  );
}