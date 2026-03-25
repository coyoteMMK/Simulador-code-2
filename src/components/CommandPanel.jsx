export default function CommandPanel({
  apagado,
  onDireccionesClick,
  onRegistrosClick,
  onCargarClick,
  onEjecutarClick,
  onContinuarClick,
}) {
  return (
    <div className="grid grid-cols-1 gap-2 font-mono">
      <button
        onClick={onDireccionesClick}
        className="py-2.5 rounded text-[11px] font-bold uppercase tracking-widest shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/20"
        disabled={apagado}
      >
        DIRECCIONES
      </button>
      <button
        onClick={onRegistrosClick}
        className="py-2.5 rounded text-[11px] font-bold uppercase tracking-widest shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-slate-500/20"
        disabled={apagado}
      >
        REGISTROS
      </button>
      <button
        onClick={onCargarClick}
        className="py-2.5 rounded text-[11px] font-bold uppercase tracking-widest shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-cyan-500/20"
        disabled={apagado}
      >
        CARGAR
      </button>
      <button
        onClick={onEjecutarClick}
        className="py-2.5 rounded text-[11px] font-bold uppercase tracking-widest shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/20"
        disabled={apagado}
      >
        EJECUTAR
      </button>
      <button
        onClick={onContinuarClick}
        className="py-2.5 rounded text-[11px] font-bold uppercase tracking-widest shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/20"
        disabled={apagado}
      >
        CONTINUAR
      </button>
    </div>
  );
}
