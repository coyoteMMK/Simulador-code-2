export default function ToastMessage({ mensaje }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50">
      <div
        className={`max-w-sm rounded-lg border border-cyan-400/30 bg-slate-900/95 px-4 py-2 text-sm text-slate-100 shadow-[0_10px_30px_-12px_rgba(34,211,238,0.55)] backdrop-blur transition-all duration-300 ${
          mensaje ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
      >
        <span className="block truncate">{mensaje || ' '}</span>
      </div>
    </div>
  );
}
