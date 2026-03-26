export default function TopAppBar({
  encendido,
  onToggleEncendido,
  onCargarPrograma,
  onInicializarMemoria,
  inicializarAlEncender,
  setInicializarAlEncender,
  modoPasoAPaso,
  onTogglePasoAPaso,
  velocidadAutoMs,
  onVelocidadAutoChange,
  apagado
}) {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-cyan-500/20 bg-[#070f1dcc] px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-3 rounded-lg border border-cyan-500/15 bg-[#0b1628]/70 px-3 py-1.5 sm:flex">
          <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.12em] text-white">Power</span>
          <button
            onClick={onToggleEncendido}
            className={`w-10 h-5 rounded-full relative p-0.5 transition-all ${
              encendido ? 'bg-lime-500/20' : 'bg-slate-600/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full transition-all ${
                encendido
                  ? 'bg-lime-300 shadow-[0_0_10px_#beff0a] translate-x-5'
                  : 'bg-slate-500 translate-x-0'
              }`}
            />
          </button>
          <span className={`font-code text-xs ${encendido ? 'text-lime-300' : 'text-slate-500'}`}>
            {encendido ? 'ON' : 'OFF'}
          </span>
          {/* Toggle para inicializar memoria al encender */}
          <div className="flex items-center gap-1 ml-4">
            <span className="font-headline text-[10px] uppercase tracking-[0.12em] text-white">Init Mem</span>
            <input
              type="checkbox"
              checked={!!inicializarAlEncender}
              onChange={e => setInicializarAlEncender && setInicializarAlEncender(e.target.checked)}
              className="accent-cyan-400 w-4 h-4 rounded focus:ring-0 border-cyan-400/40 bg-slate-800"
              style={{minWidth:'1rem', minHeight:'1rem'}}
            />
          </div>
        </div>
        {/* Paso a paso y velocidad auto */}
        <div className="flex items-center gap-4 ml-4">
          <span className="font-headline text-[10px] uppercase tracking-[0.12em] text-white">Paso a paso</span>
          <button
            type="button"
            onClick={onTogglePasoAPaso}
            disabled={apagado}
            className={`w-10 h-5 rounded-full relative p-0.5 transition-all ${modoPasoAPaso ? 'bg-lime-500/20' : 'bg-slate-600/20'} ${apagado ? 'opacity-50' : ''}`}
          >
            <div
              className={`w-4 h-4 rounded-full transition-all ${
                modoPasoAPaso
                  ? 'bg-lime-300 shadow-[0_0_10px_#beff0a] translate-x-5'
                  : 'bg-slate-500 translate-x-0'
              }`}
            />
          </button>
          <span className={`font-code text-xs ${modoPasoAPaso ? 'text-lime-300' : 'text-slate-500'}`}>{modoPasoAPaso ? 'ON' : 'OFF'}</span>
          {!modoPasoAPaso && !apagado && (
            <div className="flex items-center gap-2 ml-6">
              <span className="text-xs font-semibold tracking-wide text-indigo-300">Velocidad auto</span>
              <span className="text-xs font-semibold text-cyan-300 inline-block w-12 text-right tabular-nums">{velocidadAutoMs} ms</span>
              <input
                type="range"
                min="50"
                max="2000"
                value={velocidadAutoMs}
                onChange={e => onVelocidadAutoChange(Number(e.target.value))}
                className="h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-slate-700 accent-lime-400"
                aria-label="Velocidad de autoejecucion"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-6">
        
        <div className="flex gap-2">
          <button
            onClick={onCargarPrograma}
            className="font-headline rounded-md border border-cyan-300/25 bg-gradient-to-br from-cyan-500 to-sky-600 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_0_15px_rgba(0,209,255,0.35)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 lg:px-6"
            disabled={!encendido}
          >
            CARGAR PROGRAMA
          </button>
          <button
            onClick={onInicializarMemoria}
            className="font-headline hidden rounded-md border border-violet-400/50 bg-violet-900/20 px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-200 transition-all hover:bg-violet-700/25 disabled:opacity-50 md:block"
            disabled={!encendido}
          >
            INICIALIZAR MEMORIA
          </button>
        </div>

        <div className="flex gap-1 text-slate-500 hover:text-slate-300">
          <span className="material-symbols-outlined text-lg cursor-pointer transition-all hover:text-cyan-400">
            terminal
          </span>
          <span className="material-symbols-outlined text-lg cursor-pointer transition-all hover:text-cyan-400">
            settings
          </span>
          <span
            onClick={onToggleEncendido}
            className={`material-symbols-outlined text-lg cursor-pointer transition-all ${
              encendido ? 'text-red-500 hover:text-red-400' : 'text-slate-600'
            }`}
          >
            power_settings_new
          </span>
        </div>
      </div>
    </header>
  );
}
