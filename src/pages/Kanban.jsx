import { useEffect, useState } from "react";
import SidebarBoards from "../components/SidebarBoards.jsx";
import Column from "../components/Column.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { Plus } from "lucide-react";
import ModalCard from "../components/ModalCard.jsx";
import ModalNewColumn from "../components/ModalNewColumn.jsx";

import { API_BASE } from "../config/api.js";

export default function Kanban() {
  const [state, setState] = useState({
    boards: [],
    columns: {},
    cards: {},
    activeBoardId: null,
  });

  const [dragging, setDragging] = useState(null);
  const [cardPopup, setCardPopup] = useState({
    open: false,
    colId: null,
    index: 0,
    defaultValue: "",
    editMode: false,
    cardId: null,
  });

  const [newColumnModal, setNewColumnModal] = useState(false);

  // Cargar tableros desde API
  useEffect(() => {
    fetch(`${API_BASE}/tableros`)
      .then((res) => res.json())
      .then((data) => {
        const boards = data.map((b) => ({ id: b.id, name: b.nombre }));
        console.log("Tableros cargados:", boards); // Debug
        setState((prev) => ({
          ...prev,
          boards,
          activeBoardId: boards[0]?.id || null,
        }));
      })
      .catch(err => console.error("Error cargando tableros:", err));
  }, []);

  // Cargar columnas cuando cambia el tablero activo
  useEffect(() => {
    if (!state.activeBoardId) {
      console.log("No hay activeBoardId");
      return;
    }
    console.log("Cargando columnas para tablero:", state.activeBoardId); // Debug
    fetchColumns(state.activeBoardId);
  }, [state.activeBoardId]);

  // Cargar columnas y tareas de un tablero
  const fetchColumns = async (boardId) => {
    try {
      console.log("Fetching columnas para boardId:", boardId); // Debug
      const res = await fetch(`${API_BASE}/tableros/${boardId}`);
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      
  const tab = await res.json();
  const apiCols = Array.isArray(tab.columnas) ? tab.columnas : [];
  console.log("Columnas recibidas:", apiCols);

      const normalizeCard = (t) => {
        const av = Number(t.avance ?? 0);
        return {
          id: t.id,
          title: t.nombre ?? t.titulo ?? t.title ?? "",
          assignedTo: t.usuario_asignado ?? "",
          status: av >= 100 ? "Completado" : av > 0 ? "En progreso" : "Pendiente",
          priority: (t.prioridad ?? "media").toLowerCase(),
          dueDate: t.fecha_limite ?? "",
          createdAt: t.created_at ?? new Date().toISOString(),
        };
      };

    const normalizeCol = (c) => {
      const tarjetas = c.tareas || c.tarjetas || [];
        return {
          id: c.id,
          name: c.titulo ?? c.nombre ?? c.name ?? "",   // <- clave
          color: c.color || "#FFFFFF",
          cardIds: tarjetas.map((t) => t.id),
          posicion: c.posicion ?? 0,
        };
      };

      const nextCols = apiCols.map(normalizeCol).sort((a,b) => (a.posicion ?? 0) - (b.posicion ?? 0));
      const cardObj = {};
      apiCols.forEach((c) => (c.tareas || c.tarjetas || []).forEach((t) => { cardObj[t.id] = normalizeCard(t); }));

    setState((prev) => ({
      ...prev,
      columns: { ...prev.columns, [boardId]: nextCols },
      cards: { ...prev.cards, ...cardObj },
    }));
    } catch (err) {
      console.error("Error cargando columnas:", err);
    }
  };

  function setActive(id) {
    console.log("Cambiando tablero activo a:", id); // Debug
    setState((prev) => ({ 
      ...prev, 
      activeBoardId: id 
    }));
  }

  // Actualiza el estado y opcionalmente podrías enviar cambios al API
  function setStateAndSync(updater) {
    const next = typeof updater === "function" ? updater(state) : updater;
    setState(next);
  }

  const cols = state.columns[state.activeBoardId] || [];

  // Eliminar tarea: optimista con rollback
  async function deleteTask(cardId, colId) {
    const prev = state;
    const nextCols = (state.columns[state.activeBoardId] || []).map(c =>
      c.id === colId ? { ...c, cardIds: c.cardIds.filter(id => id !== cardId) } : c
    );
    const nextCards = { ...state.cards };
    delete nextCards[cardId];
    setStateAndSync({
      ...state,
      columns: { ...state.columns, [state.activeBoardId]: nextCols },
      cards: nextCards,
    });
    try {
      const res = await fetch(`${API_BASE}/tareas/${cardId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log("[DeleteTask] OK", cardId);
    } catch (e) {
      console.error("[DeleteTask] fallo", e);
      setState(prev); // rollback
      alert("No se pudo eliminar en el servidor.");
    }
  }

  // Función para abrir el popup de crear/editar tarjeta
  function addCard(colId, index, editExisting = false, card = null) {
    if (editExisting && card) {
      setCardPopup({
        open: true,
        colId,
        index,
        editMode: true,
        cardId: card.id,
        defaultValue: card.title,
        assignedTo: card.assignedTo || "",
        status: card.status || "Pendiente",
        priority: card.priority || "Media",
        dueDate: card.dueDate || "",
      });
    } else {
      setCardPopup({
        open: true,
        colId,
        index,
        editMode: false,
        cardId: null,
        defaultValue: "",
        assignedTo: "",
        status: "Pendiente",
        priority: "Media",
        dueDate: "",
      });
    }
  }

  // Crear tarjeta en API y reflejar en UI

  function onCardCreated(newCard) {
    if (!state.activeBoardId || !cardPopup.colId || !newCard?.id) return;
    const normalized = {
      id: newCard.id,
      title: newCard.title,
      assignedTo: newCard.assignedTo ?? "",
      status: newCard.status ?? "Pendiente",
      priority: (newCard.priority ?? "media").toLowerCase(),
      dueDate: newCard.dueDate ?? null,
      createdAt: newCard.createdAt ?? new Date().toISOString(),
    };
    const nextCols = cols.map((c) =>
      c.id === cardPopup.colId
        ? {
            ...c,
            cardIds: [
              ...c.cardIds.slice(0, cardPopup.index),
              normalized.id,
              ...c.cardIds.slice(cardPopup.index),
            ],
          }
        : c
    );
    setStateAndSync({
      ...state,
      cards: { ...state.cards, [normalized.id]: normalized },
      columns: { ...state.columns, [state.activeBoardId]: nextCols },
    });
    setCardPopup({ open: false, colId: null, index: 0, defaultValue: "", editMode: false, cardId: null });
  }

  // Actualizar tarjeta en el estado local
  function updateCard(cardId, cardData) {
    const updatedCard = { ...state.cards[cardId], ...cardData };
    setStateAndSync({
      ...state,
      cards: { ...state.cards, [cardId]: updatedCard },
    });
    setCardPopup({ 
      open: false, 
      colId: null, 
      index: 0, 
      defaultValue: "", 
      editMode: false, 
      cardId: null 
    });
  }

  // Reordenar columnas
  function onReorder(from, to) {
    if (from === to) return;
    const next = [...cols];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setStateAndSync({
      ...state,
      columns: { ...state.columns, [state.activeBoardId]: next },
    });
  }

  // Mover tarjeta entre columnas
  function moveCard(fromColId, fromIndex, toColId, toIndex) {
    if (fromColId === toColId && fromIndex === toIndex) return;
    const nextCols = cols.map((c) => ({ ...c }));
    const fromCol = nextCols.find((c) => c.id === fromColId);
    const toCol = nextCols.find((c) => c.id === toColId);
    if (!fromCol || !toCol) return;
    const [cardId] = fromCol.cardIds.splice(fromIndex, 1);
    const insertAt = fromColId === toColId && toIndex > fromIndex ? toIndex - 1 : toIndex;
    toCol.cardIds.splice(insertAt, 0, cardId);
    setStateAndSync({
      ...state,
      columns: { ...state.columns, [state.activeBoardId]: nextCols },
    });
  }

  // Crear columna
async function createColumn({ name, color }) {
  if (!state.activeBoardId) return;
  try {
    const colorMap = {
      "base.purple": "#A855F7",
      "base.red":    "#EF4444",
      "base.green":  "#10B981",
      "base.blue":   "#3B82F6",
    };
    const colorHex = colorMap[color] || color || "#FFFFFF";

    const res = await fetch(`${API_BASE}/columnas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tablero_id: state.activeBoardId,
        titulo: name,
        posicion: cols.length,
        color: colorHex,
      }),
    });
    if (!res.ok) throw new Error("Error creando columna");

    const newCol = await res.json();
    const nextCols = [...cols, { ...newCol, cardIds: [] }];
    setStateAndSync((prev) => ({
      ...prev,
      columns: { ...prev.columns, [state.activeBoardId]: nextCols },
    }));
  } catch (err) {
    console.error("Error creando columna:", err);
  }
}

  // Editar columna
async function updateColumn(colId, { name, color }) {
    if (!state.activeBoardId) return;
    try {

    const colorMap = {
      "base.purple": "#A855F7",
      "base.red": "#EF4444",
      "base.green": "#10B981",
      "base.blue": "#3B82F6",
    };

    const colorHex = colorMap[color] || color || "#FFFFFF";
        const body = new URLSearchParams({
            _method: "PATCH",
            // manda ambos nombres
            titulo: name ?? "",
            nombre: name ?? "",
            color: colorHex,
            tablero_id: String(state.activeBoardId),
            posicion: String(Math.max(0, cols.findIndex(c => c.id === colId))),
        });

        const url = `${API_BASE}/columnas/${colId}`;
        console.log("[UpdateColumna] ->", url, Object.fromEntries(body));
        console.log("[UpdateColumna:request]", {
          url,
          body: Object.fromEntries(body),
          resolvedColorHex: colorHex,
        });

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
            body: body.toString(),
        });

        const txt = await res.text();
    console.log("[UpdateColumna:response]", { status: res.status, ok: res.ok, raw: txt });
    if (!res.ok) {
            throw new Error(`Error actualizando columna (${res.status})`);
        }

        // intenta parsear, si no, usa lo enviado
        let updatedCol;
        try { updatedCol = JSON.parse(txt); } catch { updatedCol = {}; }

        console.log("[UpdateColumna:parsed]", updatedCol);

        const normalized = {
            id: updatedCol.id ?? colId,
            name: updatedCol.titulo ?? updatedCol.nombre ?? name ?? "",
            color: updatedCol.color ?? colorHex,
            cardIds: cols.find(c => c.id === colId)?.cardIds ?? [],
        };
        
        console.log("[UpdateColumna:normalized]", normalized);

        const nextCols = cols.map(c => (c.id === colId ? normalized : c));
        setStateAndSync({
            ...state,
            columns: { ...state.columns, [state.activeBoardId]: nextCols }
        });
        fetchColumns(state.activeBoardId);
    } catch (err) {
        console.error("[UpdateColumna:error]", err);
    }
}

  // Eliminar columna
  async function deleteColumn(colId) {
    if (!state.activeBoardId) return;

    try {
      const res = await fetch(`${API_BASE}/columnas/${colId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error eliminando columna");

      const nextCols = cols.filter(c => c.id !== colId);
      setStateAndSync({
        ...state,
        columns: { ...state.columns, [state.activeBoardId]: nextCols }
      });
    } catch (err) {
      console.error("Error eliminando columna:", err);
    }
  }

  
  async function handleCreateColumn({ name, color }) {
    if (!state.activeBoardId) return;

    const colorMap = {
      "base.purple": "#A855F7",
      "base.red": "#EF4444",
      "base.green": "#10B981",
      "base.blue": "#3B82F6",
    };

    const colorHex = colorMap[color] || "#FFFFFF";

    const payload = {
      tablero_id: state.activeBoardId,
      titulo: name,
      posicion: state.columns[state.activeBoardId]?.length || 0,
      color: colorHex,
    };

    console.log("[CrearColumna] POST /columnas payload:", payload);

    try {
      const res = await fetch(`${API_BASE}/columnas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("[CrearColumna] HTTP", res.status, txt);
        throw new Error(`Error creando columna (${res.status})`);
      }

      const newCol = await res.json();
      const normalized = {
        id: newCol.id,
        name: newCol.titulo ?? newCol.nombre ?? newCol.name ?? "",
        color: newCol.color || "#FFFFFF",
        cardIds: [],
      };
      console.log("[CrearColumna] OK respuesta:", newCol);

      const nextCols = [...(state.columns[state.activeBoardId] || []), normalized];
      setStateAndSync({
        ...state,
        columns: { ...state.columns, [state.activeBoardId]: nextCols },
      });
      setNewColumnModal(false);
    } catch (err) {
      console.error("Error creando columna:", err);
    }
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex h-[calc(100vh-56px)] w-full">
        <SidebarBoards 
          state={state} 
          setState={setStateAndSync} 
          setActive={setActive}
        />
        <main className="flex h-full flex-1 flex-col overflow-hidden">
          <section className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex h-full gap-6 p-6">
              {cols.map((col, idx) => (
                <div
                  key={col.id}
                  className={`shrink-0 ${dragging === idx ? "opacity-60" : ""}`}
                  draggable
                  onDragStart={() => setDragging(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onReorder(dragging, idx)}
                  onDragEnd={() => setDragging(null)}
                >
                  <Column
                    col={col}
                    cards={col.cardIds.map((id) => state.cards[id]).filter(Boolean)}
                    onAddCard={addCard}
                    onMoveCard={moveCard}
                    onUpdate={updateColumn}     
                    onDelete={deleteColumn} 
                    onDeleteCard={deleteTask}
                    state={state}
                    setState={setStateAndSync}
                  />
                </div>
              ))}

              <button onClick={() => setNewColumnModal(true)} disabled={!state.activeBoardId}>
                <div className="flex h-full items-center justify-center rounded-3xl border-4 border-base-dark bg-white">
                  <div className="flex flex-col items-center gap-2 text-base-dark">
                    <Plus size={40} strokeWidth={2.5} />
                    <span className="text-2xl font-semibold text-center">Crear Nueva Columna</span>
                  </div>
                </div>
              </button>
            </div>
          </section>
        </main>
        <ModalCard
          open={cardPopup.open}
          defaultValue={cardPopup.defaultValue}
          assignedTo={cardPopup.assignedTo}
          status={cardPopup.status}
          priority={cardPopup.priority}
          dueDate={cardPopup.dueDate}
          editMode={cardPopup.editMode}
          cardId={cardPopup.cardId}
          colId={cardPopup.colId}
          onCreate={onCardCreated}
          insertIndex={cardPopup.index}
          onUpdate={updateCard}
          onClose={() => setCardPopup({ 
            open: false, 
            colId: null, 
            index: 0, 
            defaultValue: "", 
            editMode: false, 
            cardId: null 
          })}
        />
        <ModalNewColumn
          open={newColumnModal}
          onClose={() => setNewColumnModal(false)}
          onCreate={handleCreateColumn}
        />
      </div>
    </div>
  );
}