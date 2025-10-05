import { useRef,  useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import KodigoLogo from "/logo/Kodigo.svg";
import ConfirmDialog from "./ConfirmDialog.jsx";
import PromptDialog from "./PromptDialog.jsx";

export default function SidebarBoards({ state, setState }) {
    const listRef = useRef(null);
    const active = state.activeBoardId;
    const [askDelete, setAskDelete] = useState(false);
    const [askRename, setAskRename] = useState(false);

    function setActive(id) {
        const next = { ...state, activeBoardId: id };
        setState(next);
    }

    function addBoard() {
        const id = crypto.randomUUID();
        const name = `Tablero ${state.boards.length + 1}`;
        const next = {
            ...state,
            boards: [...state.boards, { id, name }],
            columns: { ...state.columns, [id]: [] },
            activeBoardId: id,
        };
        setState(next);
    }

    function renameBoard() {
        if (!active) return;
        setAskRename(true);
    }

    function deleteBoard() {
        if (!active) return;
        setAskDelete(true);
    }

    return (
        <aside className="flex h-full w-40 flex-col bg-[#120C24] text-white">
            {/* zona fija superior */}
            <div className="flex flex-col items-center space-y-6 pt-6">
                <button
                    onClick={addBoard}
                    className="flex flex-col items-center text-xs hover:opacity-80"
                >
                    <Plus size={22} strokeWidth={2} />
                    <span className="mt-1 text-center leading-tight">Nuevo<br />Tablero</span>
                </button>

                <button
                    onClick={deleteBoard}
                    disabled={!active}
                    className="flex flex-col items-center text-xs hover:opacity-80 disabled:opacity-40"
                >
                    <Trash2 size={22} strokeWidth={2} />
                    <span className="mt-1 text-center leading-tight">Eliminar<br />Tablero</span>
                </button>

                <button
                    onClick={renameBoard}
                    disabled={!active}
                    className="flex flex-col items-center text-xs hover:opacity-80 disabled:opacity-40"
                >
                    <Pencil size={22} strokeWidth={2} />
                    <span className="mt-1 text-center leading-tight">Renombrar<br />Tablero</span>
                </button>
            </div>

            {/* separador */}
            <div className="mx-auto my-4 h-px w-5/6 bg-white/30" />

            {/* lista scrolleable */}
            <div
                ref={listRef}
                className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 text-sm"
            >
                {state.boards.map((b) => (
                    <button
                        key={b.id}
                        onClick={() => setActive(b.id)}
                        className={`block w-full rounded-md px-3 py-2 text-left ${
                            active === b.id
                                ? "bg-white text-[#120C24] font-semibold"
                                : "hover:bg-white/10"
                        }`}
                    >
                        {b.name}
                    </button>
                ))}
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
                description="Esta acción no se puede deshacer."
                confirmText="Eliminar"
                tone="danger"
                onCancel={() => setAskDelete(false)}
                onConfirm={() => {
                    const boards = state.boards.filter((b) => b.id !== active);
                    const fallback = boards[0]?.id || null;
                    const { [active]: _removed, ...restCols } = state.columns;
                    const next = {
                        ...state,
                        boards,
                        columns: restCols,
                        activeBoardId: fallback
                    };
                    setState(next);
                    setAskDelete(false);
                }}
            />

            <PromptDialog
                open={askRename}
                title="Renombrar tablero"
                label="Nuevo nombre"
                initialValue={state.boards.find((b) => b.id === active)?.name || ""}
                onCancel={() => setAskRename(false)}
                onSubmit={(value) => {
                    const name = value?.trim();
                    if (!name) { setAskRename(false); return; }
                    const next = {
                        ...state,
                        boards: state.boards.map((b) =>
                            b.id === active ? { ...b, name } : b
                        )
                    };
                    setState(next);
                    setAskRename(false);
                }}
            />
        </aside>
    );
}
