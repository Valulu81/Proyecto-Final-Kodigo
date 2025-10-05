import { useEffect } from "react";

export default function ConfirmDialog({
    open,
    title = "Confirmar",
    description = "",
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    tone = "primary", // "primary" | "danger"
    onCancel,
    onConfirm,
}) {
    useEffect(() => {
        function onKey(e) {
            if (!open) return;
            if (e.key === "Escape") onCancel?.();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onCancel]);

    if (!open) return null;

    const confirmBase =
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-dark";
    const confirmTone =
        tone === "danger"
            ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            : "bg-base-purple text-white hover:bg-base-orange focus:ring-base-orange";

    return (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" aria-labelledby="confirm-title">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onCancel} />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl bg-base-dark text-white shadow-2xl border border-white/10">
                    <div className="p-6">
                        <div className="mb-2 text-lg font-semibold" id="confirm-title">
                            {title}
                        </div>
                        {description ? (
                            <p className="mb-6 text-sm text-white/80">{description}</p>
                        ) : null}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={onCancel}
                                className="rounded-md border border-white/20 bg-[#1B1435] px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-base-purple/60 focus:ring-offset-2 focus:ring-offset-base-dark"
                            >
                                {cancelText}
                            </button>
                            <button onClick={onConfirm} className={`${confirmBase} ${confirmTone}`}>
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
