// import { useEffect, useRef, useState } from "react";

// export default function ModalCard({ open, defaultValue="", onCreate, onClose }) {
//     const [title, setTitle] = useState(defaultValue);
//     const inputRef = useRef(null);

//     useEffect(() => { if (open) { setTitle(defaultValue); setTimeout(()=>inputRef.current?.focus(),0); } }, [open, defaultValue]);
//     if (!open) return null;

//     return (
//         <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
//             <div className="w-[520px] rounded-xl bg-white p-6 shadow-xl">
//                 <h2 className="mb-4 text-xl font-semibold">Nueva tarjeta</h2>

//                 <label className="mb-1 block text-sm">Título</label>
//                 <input
//                 ref={inputRef}
//                 value={title}
//                 onChange={(e)=>setTitle(e.target.value)}
//                 onKeyDown={(e)=>{ if(e.key==="Enter") onCreate(title); if(e.key==="Escape") onClose(); }}
//                 className="mb-6 w-full rounded-md border px-3 py-2 outline-none focus:ring"
//                 placeholder="Escribe un título"
//                 />

//                 <div className="flex justify-end gap-3">
//                 <button onClick={onClose} className="rounded-md px-4 py-2 hover:bg-stone-100">Cancelar</button>
//                 <button
//                     onClick={()=>onCreate(title)}
//                     className="rounded-md bg-base-dark px-4 py-2 text-white hover:opacity-90"
//                 >
//                     Crear
//                 </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

import { useEffect, useRef, useState } from "react";

// export default function ModalCard({
//   open,
//   defaultValue = "",
//   onCreate,
//   onClose,
// }) {
//   // Campos del formulario
//   const [title, setTitle] = useState(defaultValue);
//   const [assignedTo, setAssignedTo] = useState("");
//   const [status, setStatus] = useState("Pendiente");
//   const [priority, setPriority] = useState("Media");
//   const [dueDate, setDueDate] = useState("");

//   const inputRef = useRef(null);

//   // Cuando se abre el modal, limpiar campos y enfocar
//   useEffect(() => {
//     if (open) {
//       setTitle(defaultValue);
//       setAssignedTo("");
//       setStatus("Pendiente");
//       setPriority("Media");
//       setDueDate("");
//       setTimeout(() => inputRef.current?.focus(), 0);
//     }
//   }, [open, defaultValue]);

//   if (!open) return null;

//   // Envía todos los campos como objeto
//   const handleSubmit = () => {
//     onCreate({
//       title,
//       assignedTo,
//       status,
//       priority,
//       dueDate,
//     });
//   };

//   return (
//     <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
//       <div className="w-[520px] rounded-xl bg-white p-6 shadow-xl">
//         <h2 className="mb-4 text-xl font-semibold">Nueva tarjeta</h2>

//         {/* Título */}
//         <label className="mb-1 block text-sm">Título</label>
//         <input
//           ref={inputRef}
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") handleSubmit();
//             if (e.key === "Escape") onClose();
//           }}
//           className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring"
//           placeholder="Escribe un título"
//         />

//         {/* Usuario asignado */}
//         <label className="mb-1 block text-sm">Usuario asignado</label>
//         <input
//           value={assignedTo}
//           onChange={(e) => setAssignedTo(e.target.value)}
//           className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring"
//           placeholder="Nombre del usuario"
//         />

//         {/* Estado */}
//         <label className="mb-1 block text-sm">Estado</label>
//         <select
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//           className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring"
//         >
//           <option value="Pendiente">Pendiente</option>
//           <option value="En progreso">En progreso</option>
//           <option value="Completado">Completado</option>
//         </select>

//         {/* Prioridad */}
//         <label className="mb-1 block text-sm">Prioridad</label>
//         <select
//           value={priority}
//           onChange={(e) => setPriority(e.target.value)}
//           className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring"
//         >
//           <option value="Baja">Baja</option>
//           <option value="Media">Media</option>
//           <option value="Alta">Alta</option>
//         </select>

//         {/* Fecha límite */}
//         <label className="mb-1 block text-sm">Fecha límite</label>
//         <input
//           type="date"
//           value={dueDate}
//           onChange={(e) => setDueDate(e.target.value)}
//           className="mb-6 w-full rounded-md border px-3 py-2 outline-none focus:ring"
//         />

//         {/* Botones */}
//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="rounded-md px-4 py-2 hover:bg-stone-100"
//           >
//             Cancelar
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="rounded-md bg-base-dark px-4 py-2 text-white hover:opacity-90"
//           >
//             Crear
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

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
