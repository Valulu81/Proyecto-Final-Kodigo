import { useEffect, useRef, useState } from "react";

export default function PromptDialog({
    open,
    title = "Editar",
    label = "Valor",
    initialValue = "",
    submitText = "Guardar",
    cancelText = "Cancelar",
    onCancel,
    onSubmit,
}) {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) setValue(initialValue);
    }, [open, initialValue]);

    useEffect(() => {
        function onKey(e) {
            if (!open) return;
            if (e.key === "Escape") onCancel?.();
            if (e.key === "Enter") handleSubmit();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, value]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 0);
    }, [open]);

    if (!open) return null;

    function handleSubmit() {
        const v = value.trim();
        if (!v) return;
        onSubmit?.(v);
    }

    return (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" aria-labelledby="prompt-title">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onCancel} />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-2xl bg-base-dark shadow-2xl text-white border border-white/10">
                    <div className="p-6">
                        <div className="mb-4 text-lg font-semibold" id="prompt-title">
                            {title}
                        </div>

                        <label className="mb-2 block text-sm font-medium text-white/80">{label}</label>
                        <input
                            ref={inputRef}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="mb-6 w-full rounded-md border border-white/20 bg-[#1B1435] px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-base-purple focus:ring-2 focus:ring-base-purple/50"
                            placeholder="Escribe aquí…"
                        />

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={onCancel}
                                className="rounded-md border border-white/20 bg-[#1B1435] px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-base-purple/60 focus:ring-offset-2 focus:ring-offset-base-dark"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!value.trim()}
                                className="inline-flex items-center justify-center rounded-md bg-base-purple px-4 py-2 text-sm font-medium text-white hover:bg-base-orange focus:outline-none focus:ring-2 focus:ring-base-orange/70 focus:ring-offset-2 focus:ring-offset-base-dark disabled:opacity-50"
                            >
                                {submitText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
