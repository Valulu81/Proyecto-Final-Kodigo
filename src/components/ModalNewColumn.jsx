import { useState } from "react";

const colorOptions = ["dark", "purple", "blue", "orange", "yellow", "teal"];
const COLOR_HEX = {
    dark: "#120C24",
    purple: "#472268",
    blue: "#406496",
    orange: "#EE4A24",
    yellow: "#F59023",
    teal: "#02B08E",
};

export default function ModalNewColumn({ open, onClose, onCreate }) {
    const [name, setName] = useState("");
    const [color, setColor] = useState("teal");
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white p-4">
                <h3 className="text-lg font-semibold">Nueva Columna</h3>

                <label className="mt-3 block text-sm">Nombre</label>
                <input
                    className="mt-1 w-full rounded border px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <label className="mt-3 block text-sm">Color</label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {colorOptions.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`h-8 w-8 rounded-full border ${
                                color === c ? "ring-2 ring-black" : ""
                            }`}
                        >
                            <span
                                className={`block h-full w-full rounded-full bg-base-${c}`}
                            ></span>
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded px-3 py-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onCreate({ name, color: COLOR_HEX[color] });
                            setName("");
                            setColor("teal");
                            onClose();
                        }}
                        className="rounded bg-base-dark px-3 py-2 text-white"
                    >
                        Crear
                    </button>
                </div>
            </div>
        </div>
    );
}
