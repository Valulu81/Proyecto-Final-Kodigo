import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import KodigoLogo from "/logo/Kodigo.svg";
import ConfirmDialog from "./ConfirmDialog.jsx";
import PromptDialog from "./PromptDialog.jsx";

import { API_BASE } from "../config/api.js";

export default function SidebarBoards({ state, setState, setActive }) {
  const listRef = useRef(null);
  const active = state.activeBoardId;

  const [askDelete, setAskDelete] = useState(false);
  const [askRename, setAskRename] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Cargar tableros desde la API
  useEffect(() => {
    fetch(`${API_BASE}/tableros`)
      .then((res) => res.json())
      .then((data) => {
        setState((prev) => ({
          ...prev,
          boards: data,
          activeBoardId: data[0]?.id || null,
        }));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar tableros:", error);
        setLoading(false);
      });
  }, []);

  // ✅ Crear tablero con POST al API
  async function addBoard() {
    try {
      const name = `Tablero ${state.boards.length + 1}`;
      const res = await fetch(
        `${API_BASE}/tableros?nombre=${encodeURIComponent(name)}`,
        { method: "POST" }
      );

      if (!res.ok) throw new Error("Error al crear tablero");

      // Refrescar lista
      const newList = await fetch(`${API_BASE}/tableros`).then((r) =>
        r.json()
      );

      const newBoardId = newList[newList.length - 1]?.id;
      
      setState((prev) => ({
        ...prev,
        boards: newList,
        activeBoardId: newBoardId || prev.activeBoardId,
      }));

      if (newBoardId) {
        setActive(newBoardId);
      }
    } catch (err) {
      console.error("Error al crear tablero:", err);
    }
  }

  function renameBoard() {
    if (!active) return;
    setAskRename(true);
  }

  function deleteBoard() {
    if (!active) return;
    setAskDelete(true);
  }

  // ✅ Eliminar tablero en la API
  async function handleDeleteBoard() {
    try {
      const res = await fetch(`${API_BASE}/tableros/${active}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar tablero");

      // Refrescar lista desde API
      const newList = await fetch(`${API_BASE}/tableros`).then(r => r.json());
      
      const boards = newList;
      const fallback = boards[0]?.id || null;
      
      // Limpiar las columnas del tablero eliminado
      const { [active]: _removed, ...restCols } = state.columns;
      
      const next = {
        ...state,
        boards,
        columns: restCols,
        activeBoardId: fallback,
      };
      
      setState(next);
      
      // Si hay un tablero fallback, activarlo
      if (fallback) {
        setActive(fallback);
      }
      
    } catch (err) {
      console.error("Error al eliminar tablero:", err);
      alert("Error al eliminar el tablero");
    }
  }

  // ✅ Renombrar tablero en la API
  async function handleRenameBoard(newName) {
    try {
      const res = await fetch(`${API_BASE}/tableros/${active}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: newName
        })
      });

      if (!res.ok) throw new Error("Error al renombrar tablero");

      // Refrescar lista desde API
      const newList = await fetch(`${API_BASE}/tableros`).then(r => r.json());
      
      const next = {
        ...state,
        boards: newList,
      };
      
      setState(next);
      
    } catch (err) {
      console.error("Error al renombrar tablero:", err);
      alert("Error al renombrar el tablero");
    }
  }

  // ✅ Función para manejar el cambio de tablero
  const handleBoardClick = (boardId) => {
    console.log("Cambiando a tablero:", boardId);
    setActive(boardId);
  };

  return (
    <aside className="flex h-full w-40 flex-col bg-[#120C24] text-white">
      {/* zona fija superior */}
      <div className="flex flex-col items-center space-y-6 pt-6">
        <button
          onClick={addBoard}
          className="flex flex-col items-center text-xs hover:opacity-80"
        >
          <Plus size={22} strokeWidth={2} />
          <span className="mt-1 text-center leading-tight">
            Nuevo
            <br />
            Tablero
          </span>
        </button>

        <button
          onClick={deleteBoard}
          disabled={!active}
          className="flex flex-col items-center text-xs hover:opacity-80 disabled:opacity-40"
        >
          <Trash2 size={22} strokeWidth={2} />
          <span className="mt-1 text-center leading-tight">
            Eliminar
            <br />
            Tablero
          </span>
        </button>

        <button
          onClick={renameBoard}
          disabled={!active}
          className="flex flex-col items-center text-xs hover:opacity-80 disabled:opacity-40"
        >
          <Pencil size={22} strokeWidth={2} />
          <span className="mt-1 text-center leading-tight">
            Renombrar
            <br />
            Tablero
          </span>
        </button>
      </div>

      {/* separador */}
      <div className="mx-auto my-4 h-px w-5/6 bg-white/30" />

      {/* lista scrolleable */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 text-sm"
      >
        {loading ? (
          <div className="text-white/60 text-center mt-4">Cargando...</div>
        ) : state.boards.length === 0 ? (
          <div className="text-white/60 text-center mt-4">No hay tableros</div>
        ) : (
          state.boards.map((b) => (
            <button
              key={b.id}
              onClick={() => handleBoardClick(b.id)}
              className={`block w-full rounded-md px-3 py-2 text-left ${
                active === b.id
                  ? "bg-white text-[#120C24] font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              {b.nombre || b.name}
            </button>
          ))
        )}
      </div>

      {/* logo inferior */}
      <div className="flex items-center justify-center py-6">
        <img
          src={KodigoLogo}
          alt="Logo Kodigo"
          className="h-24 opacity-95 transition-transform duration-200 hover:scale-105 hover:opacity-100"
        />
      </div>

      {/* --- Modales --- */}
      <ConfirmDialog
        open={askDelete}
        title="Eliminar tablero"
        description="¿Estás seguro de que quieres eliminar este tablero? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        tone="danger"
        onCancel={() => setAskDelete(false)}
        onConfirm={() => {
          handleDeleteBoard();
          setAskDelete(false);
        }}
      />

      <PromptDialog
        open={askRename}
        title="Renombrar tablero"
        label="Nuevo nombre"
        initialValue={state.boards.find((b) => b.id === active)?.nombre || ""}
        onCancel={() => setAskRename(false)}
        onSubmit={(value) => {
          const name = value?.trim();
          if (!name) {
            setAskRename(false);
            return;
          }
          handleRenameBoard(name);
          setAskRename(false);
        }}
      />
    </aside>
  );
}