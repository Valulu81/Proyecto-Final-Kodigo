import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";

export default function MenuDots({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Cerrar al hacer clic fuera o presionar Esc
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const select = (fn) => {
    fn?.();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-8 w-8 place-items-center rounded-md hover:bg-black/10"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal size={24} strokeWidth={2.3} className="text-base-dark" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-10 w-44 rounded-lg border bg-white p-1 shadow-lg"
        >
          <button
            role="menuitem"
            onClick={() => select(onEdit)}
            className="flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-stone-100"
          >
            <Pencil size={16} /> Editar
          </button>
          <button
            role="menuitem"
            onClick={() => select(onDelete)}
            className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-red-600 hover:bg-stone-100"
          >
            <Trash2 size={16} /> Eliminar Columna
          </button>
        </div>
      )}
    </div>
  );
}
