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
          <span
            onClick={onToggleEncendido}
            className={`material-symbols-outlined text-2xl cursor-pointer transition-all select-none text-red-500 hover:text-red-400 hover:scale-110 outline-none`}
            style={{ userSelect: 'none', textShadow: '0 0 0 #000', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 8px #ff3b3b, 0 0 2px #fff'}
            onMouseLeave={e => e.currentTarget.style.textShadow = '0 0 0 #000'}
            title={encendido ? 'Apagar' : 'Encender'}
            role="button"
            tabIndex={0}
            aria-label={encendido ? 'Apagar' : 'Encender'}
          >
            power_settings_new
          </span>
          <span
            className={`ml-1 inline-block w-3 h-3 rounded-full border border-slate-700 shadow ${encendido ? 'bg-lime-400 shadow-[0_0_8px_#beff0a]' : 'bg-slate-500'}`}
            title={encendido ? 'Encendido' : 'Apagado'}
            aria-label={encendido ? 'Encendido' : 'Apagado'}
          />
          {/* Toggle para inicializar memoria al encender */}
          <div className="flex items-center gap-1 ml-4">
            <span className="font-headline text-[10px] uppercase tracking-[0.12em] text-white">Inicializar memoria al encender</span>
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
          <span className={`font-headline text-[10px] uppercase tracking-[0.12em] ${apagado ? 'text-slate-500' : 'text-white'}`}>Paso a paso</span>
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

      <div className="flex items-center gap-2 lg:gap-6 ml-2">
        <div className="flex gap-2">
          <button
            onClick={onCargarPrograma}
            className="font-headline rounded-md border border-cyan-400/50 bg-cyan-900/20 px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200 transition-all duration-150 hover:bg-cyan-700 hover:text-white active:scale-95 lg:px-6"
          >
            CARGAR PROGRAMA
          </button>
          <button
            onClick={onInicializarMemoria}
            className="font-headline hidden rounded-md border border-violet-400/50 bg-violet-900/20 px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-200 transition-all duration-150 hover:bg-violet-700 hover:text-white active:scale-95 md:block"
          >
            INICIALIZAR MEMORIA
          </button>
        </div>
      </div>
    </header>
  );
} 
