import { toHex } from '../simulator/core';
import HexDisplay from './HexDisplay';

export default function RegistersPanel({ registros, filasRegistros, onEditRegistro, apagado, className = '' }) {
  return (
    <article className={`flex flex-col rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-headline text-sm font-semibold uppercase tracking-[0.12em] text-white">Registros</h2>
      </div>

      <div className="flex flex-col gap-2">
        {filasRegistros.map((fila, filaIdx) => (
          <div key={`fila-${filaIdx}`} className="grid grid-cols-4 gap-2">
            {fila.map((idx) => (
              <button
                type="button"
                key={`reg-${idx}`}
                onClick={() => onEditRegistro(idx)}
                className="min-h-[78px] rounded-md border border-cyan-500/10 bg-[#0a1525] px-2 py-2 flex flex-col items-center justify-center text-center transition hover:border-cyan-400/30 hover:bg-[#102338]"
                disabled={apagado}
              >
                <p className="font-headline text-[10px] uppercase tracking-[0.12em] text-cyan-300 text-center w-full">
                  r{idx.toString(16).toUpperCase()}
                </p>
                <HexDisplay
                  value={toHex(registros[idx], 4)}
                  apagado={apagado}
                  className="!mt-1 !w-full !border-cyan-500/15 !bg-black/50 !px-1 !text-[1.15rem] !font-code !text-lime-300 text-center"
                />
              </button>
            ))}
          </div>
        ))}
      </div>
    </article>
  );
}
