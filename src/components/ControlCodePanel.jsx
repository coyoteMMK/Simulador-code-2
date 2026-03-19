import { useMemo, useState } from 'react';
import HexDisplay from './HexDisplay';

const TOTAL_PORTS = 256;
const PAGE_SIZE = 3;

const toHex2 = (value) => (value & 0xff).toString(16).toUpperCase().padStart(2, '0');
const toHex4 = (value) => (value & 0xffff).toString(16).toUpperCase().padStart(4, '0');

export default function ControlCodePanel({ ipPorts = [], opPorts = [], apagado, onEditIp }) {
  const [ipPage, setIpPage] = useState(0);
  const [opPage, setOpPage] = useState(0);
  const totalPages = Math.ceil(TOTAL_PORTS / PAGE_SIZE);
  const ipStart = Math.min(ipPage * PAGE_SIZE, TOTAL_PORTS - PAGE_SIZE);
  const ipEnd = ipStart + PAGE_SIZE - 1;
  const opStart = Math.min(opPage * PAGE_SIZE, TOTAL_PORTS - PAGE_SIZE);
  const opEnd = opStart + PAGE_SIZE - 1;

  const puertosIpVisibles = useMemo(
    () => Array.from({ length: PAGE_SIZE }, (_, i) => ipStart + i),
    [ipStart],
  );

  const puertosOpVisibles = useMemo(
    () => Array.from({ length: PAGE_SIZE }, (_, i) => opStart + i),
    [opStart],
  );

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-3 text-center text-lg font-semibold">Control CODE-2</h2>

      <div className="grid gap-3 grid-cols-1">
        <div className="rounded-lg border border-slate-700">
          <div className="flex items-center justify-center gap-2 border-b border-slate-700 px-2 py-1 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setIpPage((prev) => Math.max(0, prev - 1))}
              disabled={ipPage === 0}
              className="rounded border border-slate-600 px-2 py-1 disabled:opacity-40"
            >
              &lt;
            </button>
            <span>H{toHex2(ipStart)}-H{toHex2(ipEnd)}</span>
            <button
              type="button"
              onClick={() => setIpPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={ipPage >= totalPages - 1}
              className="rounded border border-slate-600 px-2 py-1 disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
          <table className="w-full border-collapse text-center text-sm">
            <tbody>
              {puertosIpVisibles.map((puerto) => (
                <tr key={`ip-${puerto}`} className="odd:bg-slate-900 even:bg-slate-800/60">
                  <td className="border border-slate-700 px-2 py-2 font-medium">IP{toHex2(puerto)}</td>
                  <td
                    className={`border border-slate-700 px-2 py-2 ${apagado ? '' : 'cursor-pointer hover:bg-cyan-900/40'}`}
                    onClick={() => {
                      if (!apagado) {
                        onEditIp?.(puerto);
                      }
                    }}
                  >
                    <HexDisplay value={toHex4(ipPorts[puerto] ?? 0)} apagado={apagado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-slate-700">
          <div className="flex items-center justify-center gap-2 border-b border-slate-700 px-2 py-1 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setOpPage((prev) => Math.max(0, prev - 1))}
              disabled={opPage === 0}
              className="rounded border border-slate-600 px-2 py-1 disabled:opacity-40"
            >
              &lt;
            </button>
            <span>H{toHex2(opStart)}-H{toHex2(opEnd)}</span>
            <button
              type="button"
              onClick={() => setOpPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={opPage >= totalPages - 1}
              className="rounded border border-slate-600 px-2 py-1 disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
          <table className="w-full border-collapse text-center text-sm">
            <tbody>
              {puertosOpVisibles.map((puerto) => (
                <tr key={`op-${puerto}`} className="odd:bg-slate-900 even:bg-slate-800/60">
                  <td className="border border-slate-700 px-2 py-2 font-medium">OP{toHex2(puerto)}</td>
                  <td className="border border-slate-700 px-2 py-2">
                    <HexDisplay value={toHex4(opPorts[puerto] ?? 0)} apagado={apagado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
}
