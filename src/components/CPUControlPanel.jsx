

// import HexDisplay from './HexDisplay';
import HexInput from './HexInput';
// import CpuStatusPanel from './CpuStatusPanel';

import HexDisplay from './HexDisplay';
function OpPanel({ visualOp1, visualOp2 }) {
  return (
    <div className="flex flex-col justify-center rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 px-3 py-3 gap-2 w-fit mx-auto">
      <div className="flex flex-row items-center gap-2">
        <span className="font-headline text-[10px] uppercase tracking-[0.12em] text-cyan-300 text-center min-w-[38px]">D/OP1</span>
        <HexDisplay value={visualOp1} className="!w-[96px] !border-cyan-500/15 !bg-black/50 !px-1 !text-[1.15rem] !font-code !text-lime-300 text-center" />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="font-headline text-[10px] uppercase tracking-[0.12em] text-cyan-300 text-center min-w-[38px]">C/OP2</span>
        <HexDisplay value={visualOp2} className="!w-[96px] !border-cyan-500/15 !bg-black/50 !px-1 !text-[1.15rem] !font-code !text-lime-300 text-center" />
      </div>
    </div>
  );
}

export default function CPUControlPanel({
  irActualHex,
  pcActualHex,
  flags,
  onToggleFlag,
  modoPasoAPaso,
  onTogglePasoAPaso,
  velocidadAutoMs,
  onVelocidadAutoChange,
  apagado,
  onDireccionesClick,
  onRegistrosClick,
  onCargarClick,
  onEjecutarClick,
  onContinuarClick,
  direccionInput,
  onDireccionInputChange,
  visualOp1,
  visualOp2
}) {
  return (
    <article className="flex flex-col rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 p-4 w-full min-w-0 shadow-[0_18px_45px_-26px_rgba(10,176,255,0.45)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-headline text-sm font-semibold uppercase tracking-[0.12em] text-white">
          CPU Control
        </h2>
        <span className="font-code rounded border border-cyan-400/20 px-2 py-0.5 text-[9px] text-cyan-300">
          LIVE_EXECUTION
        </span>
      </div>
      {/* Input hexadecimal arriba, botones debajo, D/OP1 y C/OP2 a la derecha en vertical */}
      <div className="mb-4 grid grid-cols-2 gap-3 items-stretch">
        <div className="flex flex-col justify-center h-full items-center">
          <div className="w-full flex flex-col items-center">
            <HexInput
              id="direccion-cpu-panel"
              value={direccionInput}
              onChange={onDireccionInputChange}
              placeholder="0000"
              className="!w-[128px] !h-12 !rounded !border-cyan-500/15 !bg-black/50 !px-2 !text-[1.5rem] !text-lime-300 !font-code !text-center !tracking-wider"
            />
          </div>
        </div>
        <div className="flex items-start h-full"><OpPanel visualOp1={visualOp1} visualOp2={visualOp2} /></div>
      </div>

      {/* Botones de acción y navegación */}
      <div className="mb-6 grid gap-3">
        <button
          type="button"
          onClick={onDireccionesClick}
          className="w-full min-w-0 rounded bg-[#177b9a] px-3 py-2.5 font-headline text-base font-semibold text-cyan-100 transition hover:brightness-110 disabled:opacity-45"
          disabled={apagado}
        >
          DIRECCIONES
        </button>
        <button
          type="button"
          onClick={onRegistrosClick}
          className="w-full min-w-0 rounded bg-[#3c4f6f] px-3 py-2.5 font-headline text-base font-semibold text-slate-100 transition hover:brightness-110 disabled:opacity-45"
          disabled={apagado}
        >
          REGISTROS
        </button>
        <button
          type="button"
          onClick={onCargarClick}
          className="w-full min-w-0 rounded bg-[#1db7d3] px-4 py-2.5 font-headline text-base font-semibold text-slate-900 transition hover:brightness-110 disabled:opacity-45"
          disabled={apagado}
        >
          CARGAR
        </button>
        <button
          type="button"
          onClick={onEjecutarClick}
          className="w-full min-w-0 rounded bg-[#f4bf25] px-4 py-2.5 font-headline text-base font-semibold text-slate-900 transition hover:brightness-110 disabled:opacity-45"
          disabled={apagado}
        >
          EJECUTAR
        </button>
        <button
          type="button"
          onClick={onContinuarClick}
          className="w-full min-w-0 rounded bg-[#1cb68a] px-4 py-2.5 font-headline text-base font-semibold text-slate-900 transition hover:brightness-110 disabled:opacity-45"
          disabled={apagado}
        >
          CONTINUAR
        </button>
      </div>

      {/* ...controles de paso a paso y velocidad auto movidos a TopAppBar... */}
    </article>
  );
}
