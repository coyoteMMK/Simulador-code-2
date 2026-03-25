

import HexDisplay from './HexDisplay';
import HexInput from './HexInput';
import CpuStatusPanel from './CpuStatusPanel';

function OpPanel({ visualOp1, visualOp2 }) {
  return (
    <div className="flex flex-col justify-center border border-cyan-500/15 rounded-xl bg-[#0b1526]/80 px-4 py-3 min-w-[180px]">
      <div className="flex flex-row items-center mb-3">
        <span className="flex-1 font-headline text-base text-slate-300 tracking-wide">D/OP1</span>
        <span className="w-28 h-8 flex items-center justify-center rounded bg-black border border-slate-700 font-code text-xl tracking-widest select-all text-lime-200" style={{letterSpacing:'0.12em'}}>{visualOp1}</span>
      </div>
      <div className="flex flex-row items-center">
        <span className="flex-1 font-headline text-base text-slate-300 tracking-wide">C/OP2</span>
        <span className="w-28 h-8 flex items-center justify-center rounded bg-black border border-slate-700 font-code text-xl tracking-widest select-all text-lime-200" style={{letterSpacing:'0.12em'}}>{visualOp2}</span>
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
  visualOp2,
}) {
  return (
    <section className="w-full min-w-0 rounded-xl border border-cyan-500/15 bg-[#0b1526]/80 p-4 shadow-[0_18px_45px_-26px_rgba(10,176,255,0.45)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-headline text-sm font-bold uppercase tracking-[0.12em] text-slate-300">
          CPU Control
        </h3>
        <span className="font-code rounded border border-cyan-400/20 px-2 py-0.5 text-[9px] text-cyan-300">
          LIVE_EXECUTION
        </span>
      </div>

      {/* Panel de estado de CPU: IR, PC y flags */}
      <div className="mb-6">
        <CpuStatusPanel
          irActualHex={irActualHex}
          pcActualHex={pcActualHex}
          flags={flags}
          onToggleFlag={onToggleFlag}
          apagado={apagado}
        />
      </div>

      {/* Input hexadecimal arriba, botones debajo, D/OP1 y C/OP2 a la derecha en vertical */}
      <div className="mb-4 grid grid-cols-2 gap-3 items-stretch">
        <div className="flex flex-col gap-2 h-full items-center">
          <HexInput
            id="direccion-cpu-panel"
            value={direccionInput}
            onChange={onDireccionInputChange}
            apagado={apagado}
            disabled={apagado}
            placeholder="0000"
            className="!w-[104px] !rounded-md !border-cyan-500/20 !bg-black/60 !text-center !font-code !text-base !tracking-wide !shadow-none disabled:!opacity-100"
          />
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
        </div>
        <div className="flex items-stretch h-full"><OpPanel visualOp1={visualOp1} visualOp2={visualOp2} /></div>
      </div>

      {/* Botones Cargar, Ejecutar, Continuar debajo */}
      <div className="mb-6 grid gap-3">
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
    </section>
  );
}
