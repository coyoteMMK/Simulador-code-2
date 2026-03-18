import { toHex } from '../simulator/core';

export default function MemoryPanel({
  inicio,
  fin,
  bloqueMemoria,
  pc,
  resaltarEjecucion,
  onEditMemoria,
  onPrev,
  onNext,
}) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Memoria CODE (64K)</h2>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={onPrev}
            className="rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
          >
            {'<'}
          </button>
          <span>
            0x{toHex(inicio, 4)} - 0x{toHex(fin - 1, 4)}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
          >
            {'>'}
          </button>
        </div>
      </div>

      <div className="max-h-[28rem] overflow-auto rounded-lg border border-slate-700">
        <table className="w-full border-collapse text-center text-sm">
          <thead className="sticky top-0 bg-slate-800 text-slate-100">
            <tr>
              <th className="border border-slate-700 px-3 py-2">Direccion</th>
              <th className="border border-slate-700 px-3 py-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {bloqueMemoria.map((valor, i) => {
              const indexAbsoluto = inicio + i;
              const esActual = resaltarEjecucion && indexAbsoluto === pc;
              return (
                <tr
                  key={indexAbsoluto}
                  className={esActual ? 'bg-amber-300 text-slate-900' : 'odd:bg-slate-900 even:bg-slate-800/60'}
                >
                  <td className="border border-slate-700 px-3 py-2">
                    0x{toHex(indexAbsoluto, 4)}
                  </td>
                  <td
                    className="cursor-pointer border border-slate-700 px-3 py-2 hover:bg-cyan-900/50"
                    onClick={() => onEditMemoria(indexAbsoluto)}
                  >
                    0x{toHex(valor, 4)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
