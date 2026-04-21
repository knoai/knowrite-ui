export function Modal({ open, onClose, title, children, onConfirm, confirmText = '保存', confirmDisabled = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto m-4 p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-sky-400 mb-4">{title}</h3>
        <div className="space-y-3">
          {children}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition">{t('t_ev02')}</button>
          {onConfirm && (
            <button onClick={onConfirm} disabled={confirmDisabled} className="px-4 py-2 text-sm rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-50">
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
