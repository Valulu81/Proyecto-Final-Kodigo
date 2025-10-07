import { useEffect, useMemo, useState } from "react";
import SidebarBoards from "../components/SidebarBoards.jsx";
import Column from "../components/Column.jsx";
import { load, save, uid } from "../data/store.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { Plus } from "lucide-react";
import ModalCard from "../components/ModalCard.jsx";
import Tabla from "../pages/Tabla.jsx";

export default function Kanban() {
  const [state, setStateRaw] = useState(load());

  const [openNew, setOpenNew] = useState(false);

  const [askDeleteCol, setAskDeleteCol] = useState({
    open: false,
    colId: null,
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

  //GUARDA LA INFO CADA VEZ QUE SE HACE ALGO
  function setState(updater) {
    const next = typeof updater === "function" ? updater(state) : updater;
    setStateRaw(next);
    save(next);
  }

  const cols = state.columns[state.activeBoardId] || [];

  function createColumn({ name, color }) {
    const id = uid("col");
    const nextCols = [...cols, { id, name, color, cardIds: [] }];
    setState({
      ...state,
      columns: { ...state.columns, [state.activeBoardId]: nextCols },
    });
  }

  //ESTA FUNCIÓN SE ENCARGA DE AGREAGAR O EDITAR UNA TARJETA, CREA EL OBJETO O MODIFICA EL PRE EXISTENTE
  function addCard(colId, index, editExisting = false, card = null) {
    if (editExisting && card) {
      // Editar tarjeta existente
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
      // Crear nueva tarjeta
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

  //ESTA FUNCIÓN  CREA LAS TARJETAS

  function createCard(cardData) {
    const { title, assignedTo, status, priority, dueDate } = cardData;
    if (!title || title.trim() === "") {
      setCardPopup({
        open: false,
        colId: null,
        index: 0,
        defaultValue: "",
        editMode: false,
        cardId: null,
      });
      return;
    }

    const cardId = uid("card");
    const now = new Date().toISOString(); //fecha de creación

    const cards = {
      ...state.cards,
      [cardId]: {
        id: cardId,
        title: title.trim(),
        assignedTo: assignedTo?.trim() || "",
        status: status || "Pendiente",
        priority: priority || "Media",
        dueDate: dueDate || "",
        createdAt: now, // tarjeta como objeto
      },
    };

    const nextCols = cols.map((c) =>
      c.id === cardPopup.colId
        ? {
          ...c,
          cardIds: [
            ...c.cardIds.slice(0, cardPopup.index),
            cardId,
            ...c.cardIds.slice(cardPopup.index),
          ],
        }
        : c
    );

    setState({
      ...state,
      cards,
      columns: { ...state.columns, [state.activeBoardId]: nextCols },
    });

    setCardPopup({
      open: false,
      colId: null,
      index: 0,
      defaultValue: "",
      editMode: false,
      cardId: null,
    });
  }


  //ESTA FUNCIÓN MODIFICA LAS TARJETA YA CREADA A LA QUE SE LE HIZO CLICK

  function updateCard(cardId, cardData) {
    const updatedCard = {
      ...state.cards[cardId],
      ...cardData,
    };

    setState({
      ...state,
      cards: { ...state.cards, [cardId]: updatedCard },
    });

    setCardPopup({
      open: false,
      colId: null,
      index: 0,
      defaultValue: "",
      editMode: false,
      cardId: null,
    });
  }

  function renameColumn(id) {
    const name = prompt("Nuevo nombre:");
    if (!name) return;
    const nextCols = cols.map((c) => (c.id === id ? { ...c, name } : c));
    setState({
      ...state,
      columns: { ...state.columns, [state.activeBoardId]: nextCols },
    });
  }

  function deleteColumn(id) {
    setAskDeleteCol({ open: true, colId: id });
  }

  function changeColor(id) {
    const allowed = [
      "base.dark",
      "base.purple",
      "base.blue",
      "base.orange",
      "base.yellow",
      "base.teal",
    ];
    const color = prompt(`Color (${allowed.join(", ")}):`, "base.blue");
    if (!allowed.includes(color)) return;
    const nextCols = cols.map((c) => (c.id === id ? { ...c, color } : c));
    setState({
      ...state,
      columns: { ...state.columns, [state.activeBoardId]: nextCols },
    });
  }

  function updateColumn(id, patch) {
    const nextCols = cols.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setState({
      ...state,
      columns: { ...state.columns, [state.activeBoardId]: nextCols },
    });
  }

  function longInsert(colId, index) {
    if (!confirm("Insertar nueva tarjeta aquí?")) return;
    addCard(colId, index, false);
  }

  // Drag de columnas simple con pointer + reorder
  function onReorder(from, to) {
    if (from === to) return;
    const next = [...cols];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setState({
      ...state,
      columns: { ...state.columns, [state.activeBoardId]: next },
    });
  }

  function moveCard(fromColId, fromIndex, toColId, toIndex) {
    if (fromColId === toColId && fromIndex === toIndex) return;
    const nextCols = cols.map((c) => ({ ...c }));
    const fromCol = nextCols.find((c) => c.id === fromColId);
    const toCol = nextCols.find((c) => c.id === toColId);
    if (!fromCol || !toCol) return;
    const [cardId] = fromCol.cardIds.splice(fromIndex, 1);
    // si es mismo col y el índice de destino viene después, corrige desplazamiento
    const insertAt =
      fromColId === toColId && toIndex > fromIndex ? toIndex - 1 : toIndex;
    toCol.cardIds.splice(insertAt, 0, cardId);
    setState({
      ...state,
      columns: { ...state.columns, [state.activeBoardId]: nextCols },
    });
  }

  // Handlers DnD HTML5 para columnas
  function handleDragStart(idx) {
    setDragging(idx);
  }

  function handleDragOver(e) {
    e.preventDefault(); // permite drop
  }

  function handleDrop(idx) {
    if (dragging == null) return;
    onReorder(dragging, idx);
    setDragging(null);
  }

  function handleDragEnd() {
    setDragging(null);
  }

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Zona de trabajo: alto = pantalla - navbar (h-14 ≈ 56px) */}
      <div className="flex h-[calc(100vh-56px)] w-full">
        {/* Sidebar fijo a la izquierda */}
        <SidebarBoards state={state} setState={setState} />
        {/* Contenido principal */}
        <main className="flex h-full flex-1 flex-col overflow-hidden">
          <section className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex h-full gap-6 p-6">
              {cols.map((col, idx) => (
                <div
                  key={col.id}
                  className={`shrink-0 ${dragging === idx ? "opacity-60" : ""}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                >
                  {/* AQUÍ SE RENDERIZAN LAS COLUMNAS Y SE LE PASAN LAS PROPS */}
                  <Column
                    col={col}
                    cards={col.cardIds
                      .map((id) => state.cards[id])
                      .filter(Boolean)}
                    onAddCard={addCard}
                    onDelete={deleteColumn}
                    onLongInsert={longInsert}
                    onUpdate={updateColumn}
                    onMoveCard={moveCard}
                    state={state}
                    setState={setState}
                  />
                </div>
              ))}
              {/* Al final */}

              {/* BOTÓN ENORME DE CREAR NUEVA COLUMNA */}
              <button
                onClick={() => {
                  setOpenNew(true);
                  let column = {
                    name: "Nueva columna",
                    color: "base.teal",
                  };
                  createColumn(column);
                }}
                className="relative w-80 shrink-0 h-[calc(100dvh-9rem)] focus:outline-none"
              >
                <div className="flex h-full items-center justify-center rounded-3xl border-4 border-base-dark bg-white">
                  <div className="flex flex-col items-center gap-2 text-base-dark">
                    <Plus size={40} strokeWidth={2.5} />
                    <span className="text-2xl font-semibold text-center">
                      Crear Nueva Columna
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </section>
        </main>

        {/* MODAL QUE SE ABRE AL CREAR O TOCAR UNA TARJETA, CON TODAS SUS PROPS */}
        <ModalCard
          open={cardPopup.open}
          defaultValue={cardPopup.defaultValue}
          assignedTo={cardPopup.assignedTo}
          status={cardPopup.status}
          priority={cardPopup.priority}
          dueDate={cardPopup.dueDate}
          editMode={cardPopup.editMode}
          cardId={cardPopup.cardId}
          onCreate={createCard} // <<-- aquí se llama al crear una nueva tarjeta
          onUpdate={updateCard} // <<-- aquí se llama al editar una tarjeta existente
          onClose={() =>
            setCardPopup({
              open: false,
              colId: null,
              index: 0,
              defaultValue: "",
              editMode: false,
              cardId: null,
            })
          }
        />
      </div>
      {/* AVISO DE ELIMINACIÓN DE COLUMNAS, EL QUE SALE CUANDO LE DAS A LOS TRES PUNTITOS */}
      <ConfirmDialog
        open={askDeleteCol.open}
        title="Eliminar columna"
        description="Se eliminará la columna y sus tarjetas."
        confirmText="Eliminar"
        tone="danger"
        onCancel={() => setAskDeleteCol({ open: false, colId: null })}
        onConfirm={() => {
          const id = askDeleteCol.colId;
          const nextCols = cols.filter((c) => c.id !== id);
          setState({
            ...state,
            columns: { ...state.columns, [state.activeBoardId]: nextCols },
          });
          setAskDeleteCol({ open: false, colId: null });
        }}
      />
    </div>
  );
}
