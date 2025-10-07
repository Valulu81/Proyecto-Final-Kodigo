import { useEffect, useState } from "react";
import { load, save } from "../data/store.js";

export default function Tabla() {
    const [state, setState] = useState(load());
    const [rows, setRows] = useState([]);
    const [draggingIndex, setDraggingIndex] = useState(null);

    useEffect(() => {
        const today = new Date("2025-10-07");

        const activeBoardId = state.activeBoardId;
        const columns = state.columns?.[activeBoardId] || [];

        // Obtener todos los cardIds del tablero activo
        const cardIds = columns.flatMap((col) => col.cardIds);

        // Mapear esos cardIds a sus tarjetas
        const cards = cardIds
            .map((id) => state.cards?.[id])
            .filter(Boolean); // eliminar nulos

        const data = cards.map((card, index) => {
            const assignedDate = card.createdAt ? new Date(card.createdAt) : today;
            const dueDate = card.dueDate ? new Date(card.dueDate) : null;

            const totalDays =
                dueDate && assignedDate
                    ? Math.max(Math.ceil((dueDate - assignedDate) / (1000 * 60 * 60 * 24)), 0)
                    : "—";

            const remainingDays =
                dueDate
                    ? Math.max(Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)), 0)
                    : "—";

            return {
                id: card.id,
                title: card.title || "—",
                description: card.description || "—",
                assignedDate: assignedDate.toLocaleDateString("es-SV"),
                dueDate: dueDate ? dueDate.toLocaleDateString("es-SV") : "—",
                totalDays,
                remainingDays,
                priority: card.priority || "Media",
                status: card.status || "Pendiente",
                assignedBy: card.assignedBy || "—",
                assignedTo: card.assignedTo || "—",
                progress: card.progress || "—",
            };
        });

        setRows(data);
    }, [state]);


    // Función para reordenar filas
    const handleDrop = (targetIndex) => {
        if (draggingIndex === null || draggingIndex === targetIndex) return;
        const updated = [...rows];
        const [moved] = updated.splice(draggingIndex, 1);
        updated.splice(targetIndex, 0, moved);
        setRows(updated);
        setDraggingIndex(null);
    };

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <h1 className="text-2xl font-semibold p-6">📋 Vista Lista de Tareas</h1>
            <div className="flex-1 overflow-auto px-6">
                <table className="min-w-full border border-gray-300 text-lg">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="border px-2 py-1">Nº</th>
                            <th className="border px-2 py-1">Nombre</th>
                            {/* <th className="border px-2 py-1">Descripción</th> */}
                            <th className="border px-2 py-1">Fecha asignación</th>
                            <th className="border px-2 py-1">Fecha límite</th>
                            <th className="border px-2 py-1">Días totales</th>
                            <th className="border px-2 py-1">Días faltantes</th>
                            <th className="border px-2 py-1">Prioridad</th>
                            <th className="border px-2 py-1">Estado</th>
                            {/* <th className="border px-2 py-1">Asignado por</th> */}
                            <th className="border px-2 py-1">Responsable</th>
                            {/* <th className="border px-2 py-1">% Avance</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((task, index) => (
                            <tr
                                key={task.id}
                                draggable
                                onDragStart={() => setDraggingIndex(index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(index)}
                                className="hover:bg-gray-50 cursor-move"
                            >
                                <td className="border px-2 py-1 text-center">{index + 1}</td>
                                <td className="border px-2 py-1">{task.title}</td>
                                {/* <td className="border px-2 py-1">{task.description}</td> */}
                                <td className="border px-2 py-1 text-center">{task.assignedDate}</td>
                                <td className="border px-2 py-1 text-center">{task.dueDate}</td>
                                <td className="border px-2 py-1 text-center">{task.totalDays}</td>
                                <td className="border px-2 py-1 text-center">{task.remainingDays}</td>
                                <td className="border px-2 py-1 text-center">{task.priority}</td>
                                <td className="border px-2 py-1 text-center">{task.status}</td>
                                {/* <td className="border px-2 py-1 text-center">{task.assignedBy}</td> */}
                                <td className="border px-2 py-1 text-center">{task.assignedTo}</td>
                                {/* <td className="border px-2 py-1 text-center">{task.progress}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
