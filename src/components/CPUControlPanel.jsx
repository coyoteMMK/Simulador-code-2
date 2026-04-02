

// import HexDisplay from './HexDisplay';
import HexInput from './HexInput';
// import CpuStatusPanel from './CpuStatusPanel';

import HexDisplay from './HexDisplay';
function OpPanel({ visualOp1, visualOp2, apagado }) {
  // Recibe apagado como prop extra
  return (
    <div className="mx-auto flex w-full max-w-[240px] flex-col justify-center gap-2 rounded-xl border border-cyan-500/15 bg-[#101d2f] px-3 py-3">
      <div className="flex flex-row items-center gap-2">
        <span className="min-w-[38px] text-center font-headline text-[10px] uppercase tracking-[0.12em] text-cyan-300">D/OP1</span>
        <HexDisplay value={apagado ? '' : visualOp1} apagado={apagado} className="!w-[96px] !border-cyan-500/15 !bg-black/50 !px-1 !text-[1.15rem] !font-code !text-lime-300 text-center" />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="min-w-[38px] text-center font-headline text-[10px] uppercase tracking-[0.12em] text-cyan-300">C/OP2</span>
        <HexDisplay value={apagado ? '' : visualOp2} apagado={apagado} className="!w-[96px] !border-cyan-500/15 !bg-black/50 !px-1 !text-[1.15rem] !font-code !text-lime-300 text-center" />
      </div>
    </div>
  );
}

export default function CPUControlPanel({
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
    <article className={`flex flex-col rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 p-4 w-full min-w-0 transition-all duration-500 ${apagado ? 'grayscale pointer-events-none' : ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-headline text-sm font-semibold uppercase tracking-[0.12em] text-white">
          CPU Control
        </h2>
      </div>
      {/* Input hexadecimal arriba, botones debajo, D/OP1 y C/OP2 a la derecha en vertical */}
      <div className="mb-4 grid grid-cols-2 items-stretch gap-3">
        <div className="flex h-full flex-col items-center justify-center">
          <div className="flex w-full flex-col items-center">
                        <label htmlFor="direccion-cpu-panel" className="mb-1 block text-xs font-semibold text-cyan-200 tracking-wide uppercase">Input:</label>
            <HexInput
                id="direccion-cpu-panel"
                value={apagado ? '' : direccionInput}
                onChange={onDireccionInputChange}
                placeholder={apagado ? '' : 'Escribe dirección...'}
                apagado={apagado}
                className="!h-12 !w-full !max-w-[128px] !rounded !border-2 !border-cyan-400/60 !bg-black/40 !px-2 !text-center !font-code !text-[1.5rem] !tracking-wider !text-lime-300 placeholder:!text-cyan-300/60 placeholder:italic focus:!border-cyan-300 focus:!bg-[#0e223a] transition-colors"
            />
          </div>
        </div>
        <div className="flex h-full items-start"><OpPanel visualOp1={visualOp1} visualOp2={visualOp2} apagado={apagado} /></div>
      </div>

      {/* Botones de acción y navegación */}
      <div className="mb-6 grid gap-3">
        <button
          type="button"
          onClick={onDireccionesClick}
          className="w-full min-w-0 rounded bg-[#177b9a] px-3 py-2.5 font-headline text-base font-semibold text-cyan-100 transition duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-400/70 disabled:opacity-45"
          disabled={apagado}
        >
          DIRECCIONES
        </button>
        <button
          type="button"
          onClick={onRegistrosClick}
          className="w-full min-w-0 rounded bg-[#3c4f6f] px-3 py-2.5 font-headline text-base font-semibold text-slate-100 transition duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400/70 disabled:opacity-45"
          disabled={apagado}
        >
          REGISTROS
        </button>
        <button
          type="button"
          onClick={onCargarClick}
          className="w-full min-w-0 rounded bg-[#1db7d3] px-4 py-2.5 font-headline text-base font-semibold text-slate-900 transition duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-300/70 disabled:opacity-45"
          disabled={apagado}
        >
          CARGAR
        </button>
        <button
          type="button"
          onClick={onEjecutarClick}
          className="w-full min-w-0 rounded bg-[#f4bf25] px-4 py-2.5 font-headline text-base font-semibold text-slate-900 transition duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-300/70 disabled:opacity-45"
          disabled={apagado}
        >
          EJECUTAR
        </button>
        <button
          type="button"
          onClick={onContinuarClick}
          className="w-full min-w-0 rounded bg-[#1cb68a] px-4 py-2.5 font-headline text-base font-semibold text-slate-900 transition duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-95 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-300/70 disabled:opacity-45"
          disabled={apagado}
        >
          CONTINUAR
        </button>
      </div>

      {/* ...controles de paso a paso y velocidad auto movidos a TopAppBar... */}
    </article>
  );
}
