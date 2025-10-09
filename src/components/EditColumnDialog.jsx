// EditColumnDialog.jsx (versión que soporta token o hex)
import { useEffect, useState } from "react";

const COLOR_OPTIONS = [
  { id: "base.dark", hex: "#1E1B4B" },
  { id: "base.purple", hex: "#A855F7" },
  { id: "base.blue", hex: "#3B82F6" },
  { id: "base.orange", hex: "#F97316" },
  { id: "base.yellow", hex: "#FACC15" },
  { id: "base.teal", hex: "#10B981" },
];

export default function EditColumnDialog({ open, initialName, initialColor, onSave, onClose }) {
  const [name, setName] = useState(initialName || "");
  const [color, setColor] = useState(initialColor || "base.teal"); // puede ser token o hex

  useEffect(() => {
    if (open) {
      setName(initialName || "");
      // Si initialColor es un hex y coincide con una opción, selecciona el token.
      if (initialColor) {
        const found = COLOR_OPTIONS.find(o => o.hex.toLowerCase() === String(initialColor).toLowerCase());
        setColor(found ? found.id : initialColor);
      } else {
        setColor("base.teal");
      }
    }
  }, [open, initialName, initialColor]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="w-[520px] rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">Editar columna</h2>

        <label className="mb-1 block text-sm">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-md border px-3 py-2 outline-none focus:ring"
          placeholder="Nombre de la columna"
        />

        <label className="mb-2 block text-sm">Color</label>
        <div className="mb-6 flex items-center gap-3">
          {COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setColor(opt.id)}
              aria-label={opt.id}
              className={`h-8 w-8 rounded-full border ${ (color === opt.id || color === opt.hex) ? "ring-2 ring-black" : "" }`}
              style={{ backgroundColor: opt.hex }}
            />
          ))}
          {/* Si quieres permitir un color custom en hex, podrías añadir un input tipo color */}
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
