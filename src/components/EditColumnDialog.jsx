import { useEffect, useState } from "react";

const COLORS = [
    "base.dark",
    "base.purple",
    "base.blue",
    "base.orange",
    "base.yellow",
    "base.teal",
];

export default function EditColumnDialog({ open, initialName, initialColor, onSave, onClose }) {
    const [name, setName] = useState(initialName || "");
    const [color, setColor] = useState(initialColor || "base.teal");

    useEffect(() => {
        if (open) {
            setName(initialName || "");
            setColor(initialColor || "base.teal");
        }
    }, [open, initialName, initialColor]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
            <div className="w-[520px] rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">Editar</h2>

                <label className="mb-1 block text-sm">Nombre</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring"
                    placeholder="Nombre de la columna"
                />

                <label className="mb-2 block text-sm">Color</label>
                <div className="mb-6 flex items-center gap-3">
                    {COLORS.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`h-8 w-8 rounded-full border ${color===c ? "ring-2 ring-black" : ""} bg-${c.replace(".","-")}`}
                            aria-label={c}
                        />
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-md px-4 py-2 hover:bg-stone-100">Cancelar</button>
                    <button
                        onClick={() => onSave({ name, color })}
                        className="rounded-md bg-base-dark px-4 py-2 text-white hover:opacity-90"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
