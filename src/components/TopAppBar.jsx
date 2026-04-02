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
    <header className="fixed top-0 z-50 w-full border-b border-cyan-500/20 bg-[#070f1dcc] px-3 py-2 backdrop-blur-xl sm:px-4 lg:px-6 sm:py-0">
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-cyan-500/15 bg-[#0b1628]/70 px-2 py-1.5">
            <span
              onClick={onToggleEncendido}
              className={`material-symbols-outlined cursor-pointer select-none text-xl text-red-500 transition-all hover:scale-110 hover:text-red-400 ${encendido ? 'animate-powerOn' : 'animate-powerOff'}`}
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
              className={`inline-block h-3 w-3 rounded-full border border-slate-700 shadow transition-all ${encendido ? 'bg-lime-400 shadow-[0_0_8px_#beff0a] animate-ledPulse' : 'bg-slate-500'}`}
              title={encendido ? 'Encendido' : 'Apagado'}
              aria-label={encendido ? 'Encendido' : 'Apagado'}
            />

            <label className="ml-1 flex items-center gap-1">
              <span className="font-headline text-[9px] uppercase tracking-[0.12em] text-white">Inicializar</span>
              <input
                type="checkbox"
                checked={!!inicializarAlEncender}
                onChange={e => setInicializarAlEncender && setInicializarAlEncender(e.target.checked)}
                className="h-4 w-4 rounded border-cyan-400/40 bg-slate-800 accent-cyan-400"
                style={{ minWidth: '1rem', minHeight: '1rem' }}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCargarPrograma}
              className="font-headline rounded-md border border-cyan-400/50 bg-cyan-900/20 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-200 transition-all duration-150 hover:bg-cyan-700 hover:text-white active:scale-95"
            >
              CARGAR
            </button>
            <button
              onClick={onInicializarMemoria}
              className="font-headline rounded-md border border-violet-400/50 bg-violet-900/20 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-200 transition-all duration-150 hover:bg-violet-700 hover:text-white active:scale-95"
            >
              INIT
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-cyan-500/15 bg-[#0b1628]/70 px-2 py-2">

          <div className="flex items-center gap-1">
            <span className={`font-headline text-[9px] uppercase tracking-[0.12em] ${apagado ? 'text-slate-500' : 'text-white'}`}>Paso a paso</span>
            <button
              type="button"
              onClick={onTogglePasoAPaso}
              disabled={apagado}
              className={`relative h-5 w-10 rounded-full p-0.5 transition-all ${modoPasoAPaso ? 'bg-lime-500/20' : 'bg-slate-600/20'} ${apagado ? 'opacity-50' : ''}`}
            >
              <div
                className={`h-4 w-4 rounded-full transition-all ${
                  modoPasoAPaso
                    ? 'translate-x-5 bg-lime-300 shadow-[0_0_10px_#beff0a]'
                    : 'translate-x-0 bg-slate-500'
                }`}
              />
            </button>
          </div>

          {!modoPasoAPaso && !apagado && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-indigo-300">Auto</span>
              <span className="inline-block w-12 text-right text-xs font-semibold tabular-nums text-cyan-300">{velocidadAutoMs} ms</span>
              <input
                type="range"
                min="50"
                max="2000"
                value={velocidadAutoMs}
                onChange={e => onVelocidadAutoChange(Number(e.target.value))}
                className="h-1.5 w-24 cursor-pointer appearance-none rounded-lg bg-slate-700 accent-lime-400"
                aria-label="Velocidad de autoejecucion"
              />
            </div>
          )}
        </div>
      </div>

      <div className="hidden h-16 items-center justify-between gap-3 overflow-x-auto sm:flex">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-cyan-500/15 bg-[#0b1628]/70 px-3 py-1.5">
            <span
              onClick={onToggleEncendido}
              className={`material-symbols-outlined cursor-pointer select-none text-2xl text-red-500 transition-all hover:scale-110 hover:text-red-400 ${encendido ? 'animate-powerOn' : 'animate-powerOff'}`}
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
              className={`ml-1 inline-block h-3 w-3 rounded-full border border-slate-700 shadow transition-all ${encendido ? 'bg-lime-400 shadow-[0_0_8px_#beff0a] animate-ledPulse' : 'bg-slate-500'}`}
              title={encendido ? 'Encendido' : 'Apagado'}
              aria-label={encendido ? 'Encendido' : 'Apagado'}
            />
            <div className="ml-4 flex items-center gap-1">
              <span className="font-headline text-[10px] uppercase tracking-[0.12em] text-white">Inicializar memoria al encender</span>
              <input
                type="checkbox"
                checked={!!inicializarAlEncender}
                onChange={e => setInicializarAlEncender && setInicializarAlEncender(e.target.checked)}
                className="h-4 w-4 rounded border-cyan-400/40 bg-slate-800 accent-cyan-400"
                style={{ minWidth: '1rem', minHeight: '1rem' }}
              />
            </div>
          </div>

          <div className="ml-4 flex items-center gap-4">
            <span className={`font-headline text-[10px] uppercase tracking-[0.12em] ${apagado ? 'text-slate-500' : 'text-white'}`}>Paso a paso</span>
            <button
              type="button"
              onClick={onTogglePasoAPaso}
              disabled={apagado}
              className={`relative h-5 w-10 rounded-full p-0.5 transition-all ${modoPasoAPaso ? 'bg-lime-500/20' : 'bg-slate-600/20'} ${apagado ? 'opacity-50' : ''}`}
            >
              <div
                className={`h-4 w-4 rounded-full transition-all ${
                  modoPasoAPaso
                    ? 'translate-x-5 bg-lime-300 shadow-[0_0_10px_#beff0a]'
                    : 'translate-x-0 bg-slate-500'
                }`}
              />
            </button>
            {!modoPasoAPaso && !apagado && (
              <div className="ml-6 flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wide text-indigo-300">Velocidad auto</span>
                <span className="inline-block w-12 text-right text-xs font-semibold tabular-nums text-cyan-300">{velocidadAutoMs} ms</span>
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

        <div className="ml-2 flex items-center gap-2 lg:gap-6">
          <div className="flex gap-2">
            <button
              onClick={onCargarPrograma}
              className="font-headline rounded-md border border-cyan-400/50 bg-cyan-900/20 px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200 transition-all duration-150 hover:bg-cyan-700 hover:text-white active:scale-95 lg:px-6"
            >
              CARGAR PROGRAMA
            </button>
            <button
              onClick={onInicializarMemoria}
              className="font-headline rounded-md border border-violet-400/50 bg-violet-900/20 px-6 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-200 transition-all duration-150 hover:bg-violet-700 hover:text-white active:scale-95"
            >
              INICIALIZAR MEMORIA
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 
