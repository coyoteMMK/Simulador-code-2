import { useEffect, useRef } from 'react';
import HexDisplay from './HexDisplay';
import HexInput from './HexInput';

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
  flags,
  onToggleFlag,
  onToggleEncendido,
  onTogglePasoAPaso,
  inicializarAlEncender,
  onToggleInicializarAlEncender,
  onSelectModoCarga,
  onDireccionInputChange,
  velocidadAutoMs,
  onVelocidadAutoChange,
  onCargar,
  onCargarPrograma,
  onInicializarMemoria,
  onContinuar,
  onEjecutar,
}) {
  const codigoRef = useRef(null);

  useEffect(() => {
    const area = codigoRef.current;
    if (!area || !codigo) {
      return;
    }

    const lineas = codigo.split('\n');
    const idx = lineas.findIndex((linea) => linea.startsWith('>>>'));

    if (idx < 0) {
      return;
    }

    const estilo = window.getComputedStyle(area);
    const lineHeight = parseFloat(estilo.lineHeight) || 20;
    const objetivo = idx * lineHeight - area.clientHeight / 2 + lineHeight / 2;
    area.scrollTop = Math.max(0, objetivo);
  }, [codigo]);

  return (
    <section className={`grid gap-4 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-4 shadow-[0_12px_40px_-20px_rgba(34,211,238,0.25)] xl:grid-cols-2 xl:items-stretch ${apagado ? 'opacity-50 grayscale pointer-events-none select-none' : ''}`}>
      <textarea
        ref={codigoRef}
        value={codigo}
        readOnly
        placeholder="Instrucciones generadas por la memoria se mostraran aqui..."
        className="min-h-44 w-full resize-none self-stretch rounded-xl border border-slate-700/80 bg-slate-950 p-3 font-mono text-sm text-slate-200 outline-none focus:border-cyan-500/50 xl:h-full"
      />

      <div className="rounded-xl border border-slate-700/80 bg-slate-950/80 p-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/70 p-2">
              <span className="font-headline text-[12px] font-semibold uppercase tracking-[0.12em] text-white block mb-2">Controles</span>
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

              <div className="rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-indigo-300">Inicializar memoria</span>

                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inicializarAlEncender}
                      onChange={onToggleInicializarAlEncender}
                      aria-label="Inicializar memoria al encender"
                      className="sr-only"
                    />
                    <span className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-all ${
                      inicializarAlEncender
                        ? 'border-fuchsia-400 bg-fuchsia-600/90'
                        : 'border-slate-600 bg-slate-700'
                    }`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        inicializarAlEncender ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-stretch gap-2">
                <div className={`rounded-md border px-2 py-2 transition ${apagado ? 'border-slate-800 bg-slate-950/40 opacity-60' : 'border-slate-700 bg-slate-950/70'}`}>
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    {[
                      { key: 'z', label: 'Z' },
                      { key: 's', label: 'S' },
                      { key: 'c', label: 'C' },
                      { key: 'v', label: 'V' },
                    ].map((item) => {
                      const activa = !apagado && Boolean(flags?.[item.key]);
                      return (
                        <div key={item.key} className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={apagado}
                            onClick={() => onToggleFlag(item.key)}
                            aria-label={`Toggle flag ${item.label}`}
                            className={`h-3.5 w-3.5 rounded-full border transition-all ${
                              activa
                                ? 'border-lime-300 bg-lime-400 shadow-[0_0_10px_1px_rgba(163,230,53,0.8)]'
                                : apagado
                                  ? 'border-slate-700 bg-slate-900'
                                  : 'border-slate-600 bg-slate-800'
                            } ${apagado ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                          <span className={`text-[11px] font-semibold tracking-wide ${apagado ? 'text-slate-500' : 'text-indigo-300'}`}>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 rounded-md border border-slate-700 bg-slate-950 p-2">
                  <div className="space-y-1">
                    <p className="text-center text-xs font-semibold tracking-wide text-indigo-300">IR</p>
                    <HexDisplay value={irActualHex} apagado={apagado} className="mx-auto" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-center text-xs font-semibold tracking-wide text-indigo-300">PC</p>
                    <HexDisplay value={pcActualHex} apagado={apagado} className="mx-auto" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/70 p-2">
              <div className="flex justify-center">
                <HexInput
                  id="direccion"
                  value={direccionInput}
                  apagado={apagado}
                  onChange={onDireccionInputChange}
                  disabled={apagado}
                />
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onSelectModoCarga('direccion')}
                  disabled={apagado}
                  className={`w-full rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
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
                  className={`w-full rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    modoCarga === 'registro'
                      ? 'bg-cyan-700 text-cyan-100'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  Registros
                </button>
              </div>

              <button
                type="button"
                onClick={onCargar}
                disabled={apagado}
                className="w-full rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cargar
              </button>

              <button
                type="button"
                onClick={onEjecutar}
                disabled={apagado}
                className="w-full rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ejecutar
              </button>
              
              <button
                type="button"
                onClick={onContinuar}
                disabled={apagado}
                className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuar
              </button>

            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/70 p-2">
            <div className="space-y-2 rounded-md border border-slate-700 bg-slate-950/80 p-2">
              <div className="grid grid-cols-[auto_96px] items-center gap-2">
                <span className="text-sm text-indigo-300">{etiquetaOp1}</span>
                <HexDisplay value={visualOp1} apagado={apagado} />
              </div>
              <div className="grid grid-cols-[auto_96px] items-center gap-2">
                <span className="text-sm text-indigo-300">C/OP2</span>
                <HexDisplay value={visualOp2} apagado={apagado} />
              </div>
            </div>

            {!modoPasoAPaso ? (
              <div className={`space-y-2 rounded-md border p-2 transition ${apagado ? 'border-slate-800 bg-slate-950/40 opacity-60' : 'border-slate-700 bg-slate-950/70'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wide text-indigo-300">Velocidad auto</span>
                  <span className="text-xs font-semibold text-cyan-300">{velocidadAutoMs} ms</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={velocidadAutoMs}
                  disabled={apagado}
                  onChange={(event) => onVelocidadAutoChange(Number(event.target.value))}
                  className="w-full accent-cyan-400 disabled:cursor-not-allowed"
                  aria-label="Velocidad de autoejecucion"
                />
              </div>
            ) : null}

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
              onClick={onInicializarMemoria}
              disabled={apagado}
              className="rounded-md bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Inicializar Memoria
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}
