import { useRef, useState } from "react";
import { Table2, Plus } from "lucide-react";
import MenuDots from "./MenuDots.jsx";
import CardItem from "./CardItem.jsx";
import EditColumnDialog from "./EditColumnDialog.jsx";

export default function Column({
  col,
  cards,
  onAddCard,
  onRename,
  onDelete,
  onColor,
  onLongInsert,
  onUpdate,
  onMoveCard,
  state,
  setState,
}) {
  const [holdTimer, setHoldTimer] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const listRef = useRef(null);

  function startHold(index) {
    clearTimeout(holdTimer);
    const t = setTimeout(() => onLongInsert(col.id, index), 3000);
    setHoldTimer(t);
  }
  function clearHold() {
    clearTimeout(holdTimer);
  }

  function handleSave({ name, color }) {
    // preferido
    if (typeof onUpdate === "function") onUpdate(col.id, { name, color });
    // fallbacks si no existe onUpdate
    else {
      if (typeof onRename === "function" && name && name !== col.name)
        onRename(col.id, name);
      if (typeof onColor === "function" && color && color !== col.color)
        onColor(col.id, color);
    }
    setShowEdit(false);
  }

  return (
    <>
      <div className="relative w-80 shrink-0 h-[calc(100dvh-9rem)] flex">
        <div
          className={`flex w-full flex-col rounded-3xl border-4 border-base-dark bg-${col.color.replace(
            ".",
            "-"
          )} overflow-hidden`}
        >
          <div className="border-b-4 border-base-dark bg-white w-full px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table2
                  size={22}
                  strokeWidth={2.5}
                  className="text-base-dark"
                />
                <h3 className="text-2xl font-semibold truncate">{col.name}</h3>
              </div>
              <div className="flex h-7 items-center">
                <MenuDots
                  onEdit={() => setShowEdit(true)}
                  onDelete={() => onDelete(col.id)}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 pt-5 px-2">
            <div
              ref={listRef}
              className="h-full overflow-y-auto pb-24 flex flex-col gap-4"
            >
              {cards.map((c, idx) => (
                <div
                  key={c.id}
                  onMouseDown={() => startHold(idx)}
                  onMouseUp={clearHold}
                  onMouseLeave={clearHold}
                  onTouchStart={() => startHold(idx)}
                  onTouchEnd={clearHold}
                  className="self-center w-[88%]"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "text/plain",
                      JSON.stringify({ fromColId: col.id, fromIndex: idx })
                    );
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const data = JSON.parse(
                      e.dataTransfer.getData("text/plain") || "{}"
                    );
                    if (!data) return;
                    onMoveCard?.(data.fromColId, data.fromIndex, col.id, idx);
                  }}
                >
                  <CardItem
                    card={c}
                    onEdit={() => onAddCard(col.id, idx, true, c)}
                    onDelete={(cardId) => {
                      // Remover tarjeta del state
                      const nextCols = col.cardIds.filter(
                        (id) => id !== cardId
                      );
                      const updatedCols = {
                        ...state.columns,
                        [state.activeBoardId]: state.columns[
                          state.activeBoardId
                        ].map((colItem) =>
                          colItem.id === col.id
                            ? { ...colItem, cardIds: nextCols }
                            : colItem
                        ),
                      };
                      const updatedCards = { ...state.cards };
                      delete updatedCards[cardId]; // eliminar la tarjeta del objeto cards

                      setState({
                        ...state,
                        columns: updatedCols,
                        cards: updatedCards,
                      });
                    }}
                  />
                </div>
              ))}
              {/* Zona drop al final para soltar al final de la lista */}
              <div
                className="self-center w-[88%] h-6"
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  const data = JSON.parse(
                    e.dataTransfer.getData("text/plain") || "{}"
                  );
                  if (!data) return;
                  onMoveCard?.(
                    data.fromColId,
                    data.fromIndex,
                    col.id,
                    cards.length
                  );
                }}
              />
              {/* Botón agregar con el mismo ancho y centrado */}
              <div className="self-center w-[88%]">
                <button
                  onClick={() => onAddCard(col.id, cards.length, false)}
                  className="group flex h-10 items-center justify-between rounded-xl border border-dashed border-black/25 bg-white/90 px-3 w-full"
                >
                  <span className="text-sm">Agregar Tarjeta</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center">
                    <Plus
                      size={18}
                      strokeWidth={2.5}
                      className="text-base-dark"
                    />
                  </span>
                </button>
              </div>

              <div className="h-6 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      <EditColumnDialog
        open={showEdit}
        initialName={col.name}
        initialColor={col.color}
        onSave={handleSave}
        onClose={() => setShowEdit(false)}
      />
    </>
  );
}
