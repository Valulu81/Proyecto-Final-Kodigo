export default function ModalBase({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                {children}
                <button
                    onClick={onClose}
                    className="absolute left-[-9999px] top-[-9999px]"
                    aria-hidden
                    tabIndex={-1}
                />
            </div>
        </div>
    );
}
