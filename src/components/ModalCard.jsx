import { useEffect, useRef, useState } from "react";

export default function ModalCard({ open, defaultValue="", onCreate, onClose }) {
    const [title, setTitle] = useState(defaultValue);
    const inputRef = useRef(null);

    useEffect(() => { if (open) { setTitle(defaultValue); setTimeout(()=>inputRef.current?.focus(),0); } }, [open, defaultValue]);
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
            <div className="w-[520px] rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">Nueva tarjeta</h2>

                <label className="mb-1 block text-sm">Título</label>
                <input
                ref={inputRef}
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==="Enter") onCreate(title); if(e.key==="Escape") onClose(); }}
                className="mb-6 w-full rounded-md border px-3 py-2 outline-none focus:ring"
                placeholder="Escribe un título"
                />

                <div className="flex justify-end gap-3">
                <button onClick={onClose} className="rounded-md px-4 py-2 hover:bg-stone-100">Cancelar</button>
                <button
                    onClick={()=>onCreate(title)}
                    className="rounded-md bg-base-dark px-4 py-2 text-white hover:opacity-90"
                >
                    Crear
                </button>
                </div>
            </div>
        </div>
    );
}
