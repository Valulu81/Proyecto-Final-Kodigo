import { useEffect, useMemo, useState } from "react";
import SidebarBoards from "../components/SidebarBoards.jsx";
import Column from "../components/Column.jsx";
import ModalNewColumn from "../components/ModalNewColumn.jsx";
import { load, save, uid } from "../data/store.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import PromptDialog from "../components/PromptDialog.jsx";
import Navbar from "../components/Navbar.jsx";
import { Plus } from "lucide-react";
import ModalCard from "../components/ModalCard.jsx";

export default function Kanban() {
    const [state, setStateRaw] = useState(load());
    const [openNew, setOpenNew] = useState(false);
    const [askDeleteCol, setAskDeleteCol] = useState({ open: false, colId: null });
    const [dragging, setDragging] = useState(null);
    const [cardPopup, setCardPopup] = useState({ open:false, colId:null, index:0, defaultValue:"" });

    function setState(updater){
        const next = typeof updater === "function" ? updater(state) : updater;
        setStateRaw(next);
        save(next);
    }

    const cols = state.columns[state.activeBoardId] || [];

    function createColumn({ name, color }){
        const id = uid("col");
        const nextCols = [...cols, { id, name, color, cardIds: [] }];
        setState({ ...state, columns:{ ...state.columns, [state.activeBoardId]: nextCols } });
    }

function addCard(colId, index, editExisting){
        setCardPopup({ open:true, colId, index, defaultValue: editExisting ? "Editar contenido" : "" });
    }
    function createCardWithTitle(title){
        if(title==null || title.trim()===""){ setCardPopup({ open:false, colId:null, index:0, defaultValue:"" }); return; }
        const cardId = uid("card");
        const cards = { ...state.cards, [cardId]: { id: cardId, title: title.trim() } };
        const nextCols = cols.map(c =>
            c.id===cardPopup.colId
            ? { ...c, cardIds: [...c.cardIds.slice(0,cardPopup.index), cardId, ...c.cardIds.slice(cardPopup.index)] }
            : c
        );
        setState({ ...state, cards, columns:{ ...state.columns, [state.activeBoardId]: nextCols } });
        setCardPopup({ open:false, colId:null, index:0, defaultValue:"" });
    }

    function renameColumn(id){
        const name = prompt("Nuevo nombre:");
        if(!name) return;
        const nextCols = cols.map(c=>c.id===id?{...c,name}:c);
        setState({ ...state, columns:{ ...state.columns, [state.activeBoardId]: nextCols } });
    }
    function deleteColumn(id){
        setAskDeleteCol({ open: true, colId: id });
    }
    function changeColor(id){
        const allowed = ["base.dark","base.purple","base.blue","base.orange","base.yellow","base.teal"];
        const color = prompt(`Color (${allowed.join(", ")}):`, "base.blue");
        if(!allowed.includes(color)) return;
        const nextCols = cols.map(c=>c.id===id?{...c,color}:c);
        setState({ ...state, columns:{ ...state.columns, [state.activeBoardId]: nextCols } });
    }
    function updateColumn(id, patch){
        const nextCols = cols.map(c =>
            c.id === id ? { ...c, ...patch } : c
        );
        setState({
            ...state,
            columns: { ...state.columns, [state.activeBoardId]: nextCols },
        });
    }
    function longInsert(colId, index){
        if(!confirm("Insertar nueva tarjeta aquí?")) return;
        addCard(colId, index, false);
    }

    // Drag de columnas simple con pointer + reorder
    function onReorder(from, to){
        if(from===to) return;
        const next = [...cols];
        const [moved] = next.splice(from,1);
        next.splice(to,0,moved);
        setState({ ...state, columns:{ ...state.columns, [state.activeBoardId]: next } });
    }

    function moveCard(fromColId, fromIndex, toColId, toIndex){
        if(fromColId === toColId && fromIndex === toIndex) return;
        const nextCols = cols.map(c => ({ ...c }));
        const fromCol = nextCols.find(c => c.id === fromColId);
        const toCol   = nextCols.find(c => c.id === toColId);
        if(!fromCol || !toCol) return;
        const [cardId] = fromCol.cardIds.splice(fromIndex, 1);
        // si es mismo col y el índice de destino viene después, corrige desplazamiento
        const insertAt = (fromColId===toColId && toIndex>fromIndex) ? toIndex-1 : toIndex;
        toCol.cardIds.splice(insertAt, 0, cardId);
        setState({ ...state, columns:{ ...state.columns, [state.activeBoardId]: nextCols } });
    }
    // Handlers DnD HTML5 para columnas
    function handleDragStart(idx){
        setDragging(idx);
    }
    function handleDragOver(e){
        e.preventDefault(); // permite drop
    }
    function handleDrop(idx){
        if(dragging==null) return;
        onReorder(dragging, idx);
        setDragging(null);
    }
    function handleDragEnd(){
        setDragging(null);
    }

    return (
        <div className="flex h-screen w-full flex-col">
            {/* Navbar fijo arriba */}
            <Navbar />
            {/* Zona de trabajo: alto = pantalla - navbar (h-14 ≈ 56px) */}
            <div className="flex h-[calc(100vh-56px)] w-full">
                {/* Sidebar fijo a la izquierda */}
                <SidebarBoards state={state} setState={setState} />
                {/* Contenido principal */}
                <main className="flex h-full flex-1 flex-col overflow-hidden">
                    <section className="flex-1 overflow-x-auto overflow-y-hidden">
                        <div className="flex h-full gap-6 p-6">
                    {cols.map((col, idx)=>(
                        <div
                            key={col.id}
                            className={`shrink-0 ${dragging===idx ? "opacity-60" : ""}`}
                            draggable
                            onDragStart={()=>handleDragStart(idx)}
                            onDragOver={handleDragOver}
                            onDrop={()=>handleDrop(idx)}
                            onDragEnd={handleDragEnd}
                        >
                            <Column
                                col={col}
                                cards={col.cardIds.map(id=>state.cards[id]).filter(Boolean)}
                                onAddCard={addCard}
                                onDelete={deleteColumn}
                                onLongInsert={longInsert}
                                onUpdate={updateColumn}
                                onMoveCard={moveCard}
                            />
                        </div>
                    ))}
                    {/* Al final */}

                    <button
                        onClick={()=>setOpenNew(true)}
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
                <ModalCard
                    open={cardPopup.open}
                    defaultValue={cardPopup.defaultValue}
                    onCreate={createCardWithTitle}
                    onClose={()=>setCardPopup({ open:false, colId:null, index:0, defaultValue:"" })}
                />
            </div>

            <ConfirmDialog
                open={askDeleteCol.open}
                title="Eliminar columna"
                description="Se eliminará la columna y sus tarjetas."
                confirmText="Eliminar"
                tone="danger"
                onCancel={()=>setAskDeleteCol({ open:false, colId:null })}
                onConfirm={()=>{
                    const id = askDeleteCol.colId;
                    const nextCols = cols.filter(c=>c.id!==id);
                    setState({ ...state, columns:{ ...state.columns, [state.activeBoardId]: nextCols } });
                    setAskDeleteCol({ open:false, colId:null });
                }}
            />
        </div>
    );
}
