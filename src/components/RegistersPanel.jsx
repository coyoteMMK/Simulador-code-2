import { toHex } from '../simulator/core';
import HexDisplay from './HexDisplay';

export default function RegistersPanel({ registros, filasRegistros, onEditRegistro, apagado }) {
  return (
    <article className="flex h-full min-h-0 flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-3 text-lg font-semibold">Registros</h2>
      <div className="max-h-[28rem] overflow-auto rounded-lg border border-slate-700 xl:max-h-none xl:min-h-0">
        <table className="w-full border-collapse text-center text-sm">
          <tbody>
            {filasRegistros.map(([izq, der], fila) => (
              <tr key={fila} className="odd:bg-slate-900 even:bg-slate-800/60">
                <td className="border border-slate-700 px-3 py-2">
                  r{izq.toString(16).toUpperCase()}
                </td>
                <td
                  className="cursor-pointer border border-slate-700 px-3 py-2 hover:bg-cyan-900/50"
                  onClick={() => onEditRegistro(izq)}
                >
                  <HexDisplay value={toHex(registros[izq], 4)} apagado={apagado} />
                </td>
                <td className="border border-slate-700 px-3 py-2">
                  r{der.toString(16).toUpperCase()}
                </td>
                <td
                  className="cursor-pointer border border-slate-700 px-3 py-2 hover:bg-cyan-900/50"
                  onClick={() => onEditRegistro(der)}
                >
                  <HexDisplay value={toHex(registros[der], 4)} apagado={apagado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
