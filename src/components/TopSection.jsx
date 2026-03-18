import HexDisplay from './HexDisplay';

export default function TopSection({
  codigo,
  encendido,
  apagado,
  modoPasoAPaso,
  irActualHex,
  pcActualHex,
  etiquetaOp1,
  visualOp1,
  visualOp2,
  modoCarga,
  direccionInput,
  onToggleEncendido,
  onTogglePasoAPaso,
  onSelectModoCarga,
  onDireccionInputChange,
  onCargarPrograma,
  onContinuar,
  onEjecutar,
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-4 shadow-[0_12px_40px_-20px_rgba(34,211,238,0.25)] xl:grid-cols-2">
      <textarea
        value={codigo}
        readOnly
        placeholder="Instrucciones generadas por la memoria se mostraran aqui..."
        className="h-44 w-full resize-none rounded-xl border border-slate-700/80 bg-slate-950 p-3 font-mono text-sm text-slate-200 outline-none focus:border-cyan-500/50"
      />

      <div className="rounded-xl border border-slate-700/80 bg-slate-950/80 p-3">
        <div className="grid gap-3 md:grid-cols-[1fr_170px]">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/70 p-2">
              <button
                type="button"
                onClick={onToggleEncendido}
                className={`relative inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold tracking-widest shadow-lg transition-all ${
                  encendido
                    ? 'bg-rose-600 text-white shadow-rose-700/50 hover:bg-rose-500'
                    : 'bg-slate-700 text-slate-300 shadow-slate-900/50 hover:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    encendido ? 'bg-lime-400 shadow-[0_0_8px_2px_rgba(163,230,53,0.8)]' : 'bg-slate-500'
                  }`}
                />
                {encendido ? 'ON' : 'OFF'}
              </button>

              <button
                type="button"
                onClick={onTogglePasoAPaso}
                disabled={apagado}
                className={`relative inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold tracking-widest shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  !apagado && modoPasoAPaso
                    ? 'bg-emerald-600 text-white shadow-emerald-700/50 hover:bg-emerald-500'
                    : 'bg-slate-700 text-slate-300 shadow-slate-900/50 hover:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    !apagado && modoPasoAPaso ? 'bg-lime-400 shadow-[0_0_8px_2px_rgba(163,230,53,0.8)]' : 'bg-slate-500'
                  }`}
                />
                Paso a paso
              </button>

              <div className="space-y-1 rounded-md border border-slate-700 bg-slate-950 p-2">
                <div className="space-y-1">
                  <p className="text-center text-xs font-semibold tracking-wide text-indigo-300">IR</p>
                  <HexDisplay value={irActualHex} apagado={apagado} className="w-full text-4xl leading-none" />
                </div>
                <div className="space-y-1">
                  <p className="text-center text-xs font-semibold tracking-wide text-indigo-300">PC</p>
                  <HexDisplay value={pcActualHex} apagado={apagado} className="w-full text-4xl leading-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/70 p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-indigo-300">{etiquetaOp1}</span>
                <HexDisplay value={visualOp1} apagado={apagado} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-indigo-300">C/OP2</span>
                <HexDisplay value={visualOp2} apagado={apagado} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectModoCarga('direccion')}
                  disabled={apagado}
                  className={`rounded-md px-2 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    modoCarga === 'direccion'
                      ? 'bg-cyan-700 text-cyan-100'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Direcciones
                </button>
                <button
                  type="button"
                  onClick={() => onSelectModoCarga('registro')}
                  disabled={apagado}
                  className={`rounded-md px-2 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    modoCarga === 'registro'
                      ? 'bg-cyan-700 text-cyan-100'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Registros
                </button>
              </div>

              <input
                id="direccion"
                value={direccionInput}
                onChange={onDireccionInputChange}
                disabled={apagado}
                placeholder="0000"
                className="w-full rounded-md border border-slate-600 bg-slate-950 px-2 py-2 font-mono text-sm text-slate-100 outline-none focus:border-cyan-400 disabled:opacity-40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-2">
            <button
              type="button"
              onClick={onCargarPrograma}
              disabled={apagado}
              className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cargar Programa
            </button>
            <button
              type="button"
              onClick={onContinuar}
              disabled={apagado}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={onEjecutar}
              disabled={apagado}
              className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Iniciar ejecucion
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
