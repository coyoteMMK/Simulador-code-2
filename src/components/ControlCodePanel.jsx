import { useMemo, useRef, useState } from 'react';
import HexDisplay from './HexDisplay';
import HexInput from './HexInput';

const TOTAL_PORTS = 256;
const PAGE_SIZE = 3;
const TOAST_COLUMNS = 4;

const toHex2 = (value) => (value & 0xff).toString(16).toUpperCase().padStart(2, '0');
const toHex4 = (value) => (value & 0xffff).toString(16).toUpperCase().padStart(4, '0');

export default function ControlCodePanel({
  ipPorts = [],
  opPorts = [],
  apagado,
  onEditIp,
  onEditIpValue,
  onFormatoInvalido,
  className = '',
}) {
  const [ipPage, setIpPage] = useState(0);
  const [opPage, setOpPage] = useState(0);
  const [toastPuertos, setToastPuertos] = useState(null);
  const [edicionesIp, setEdicionesIp] = useState({});
  const inputRefs = useRef({});
  const edicionManualIpRef = useRef({});
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

  const filasToast = useMemo(() => {
    const filas = [];
    const porColumna = Math.ceil(TOTAL_PORTS / TOAST_COLUMNS);
    for (let fila = 0; fila < porColumna; fila += 1) {
      const grupo = [];
      for (let col = 0; col < TOAST_COLUMNS; col += 1) {
        const idx = col * porColumna + fila;
        if (idx < TOTAL_PORTS) {
          grupo.push(idx);
        }
      }
      filas.push(grupo);
    }
    return filas;
  }, []);
  const toastEsEntrada = toastPuertos === 'ip';

  const textoPuertoIp = (index, valorActual) => edicionesIp[index] ?? toHex4(valorActual);

  const confirmarEdicionIp = (index, valorActual, textoForzado) => {
    const texto = (textoForzado ?? textoPuertoIp(index, valorActual)).trim();
    const sinPrefijo = texto.toLowerCase().startsWith('0x') ? texto.slice(2) : texto;
    const valorHexActual = toHex4(valorActual);
    const huboEdicionManual = Boolean(edicionManualIpRef.current[index]);

    // Si no hubo cambio real, no guardar ni notificar nada.
    if (/^[0-9a-fA-F]{1,4}$/.test(sinPrefijo)) {
      const valorSinCambios = parseInt(sinPrefijo, 16) & 0xffff;
      if (!huboEdicionManual && valorSinCambios === (valorActual & 0xffff)) {
        setEdicionesIp((prev) => {
          if (!(index in prev)) {
            return prev;
          }
          const siguiente = { ...prev };
          delete siguiente[index];
          return siguiente;
        });
        edicionManualIpRef.current[index] = false;
        return;
      }
    }

    if (!/^[0-9a-fA-F]{1,4}$/.test(sinPrefijo)) {
      setEdicionesIp((prev) => ({ ...prev, [index]: valorHexActual }));
      onFormatoInvalido?.();
      edicionManualIpRef.current[index] = false;
      return;
    }

    const valor = parseInt(sinPrefijo, 16) & 0xffff;
    onEditIpValue?.(index, valor);
    setEdicionesIp((prev) => ({ ...prev, [index]: toHex4(valor) }));
    edicionManualIpRef.current[index] = false;
  };

  const enfocarPuerto = (index, cursorPos = 0) => {
    if (index < 0 || index >= TOTAL_PORTS) {
      return;
    }

    window.requestAnimationFrame(() => {
      const input = inputRefs.current[index];
      if (input) {
        const pos = Math.max(0, Math.min(cursorPos, 3));
        input.focus();
        input.setSelectionRange(pos, pos + 1);
      }
    });
  };

  const enfocarSiguientePuerto = (indexActual) => {
    enfocarPuerto(indexActual + 1, 0);
  };

  return (
    <article className={`flex flex-col rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 p-4 ${className}`}>
      <div className="mb-3 flex items-center gap-3">
        <h2 className="font-headline text-sm font-semibold uppercase tracking-[0.12em] text-white text-left">Controles de Puertos</h2>
        <span className="font-code text-[10px] text-cyan-300">BUS_SYNCED</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Entrada */}
        <div className="flex flex-col rounded-md border border-cyan-500/10 bg-[#0a1626]">
          <div className="flex items-center border-b border-cyan-500/10 px-2 pt-3 pb-1 text-xs text-slate-300">
            <p className="font-headline text-[16px] font-bold uppercase tracking-[0.15em] text-white text-left flex-1 m-0">ENTRADA</p>
            <div className="flex-1 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setEdicionesIp({});
                  inputRefs.current = {};
                  setToastPuertos('ip');
                }}
                className="rounded border border-cyan-700/45 bg-cyan-900/20 px-2 py-1 text-cyan-200"
              >
                Mostrar todos
              </button>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
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
          </div>
          {/* Título movido arriba */}
          <table className="w-full border-collapse text-center text-sm">
            <tbody>
              {puertosIpVisibles.map((puerto) => (
                <tr key={`ip-${puerto}`} className="odd:bg-[#0a1626] even:bg-[#0f1d30]">
                  <td className="border-b border-cyan-500/10 px-2 py-2 font-code font-medium text-slate-400">IP{toHex2(puerto)}</td>
                  <td
                    className={`border-b border-cyan-500/10 px-2 py-2 ${apagado ? '' : 'cursor-pointer hover:bg-cyan-900/20'}`}
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

        {/* Salida */}
        <div className="flex flex-col rounded-md border border-cyan-500/10 bg-[#0a1626]">
          <div className="flex items-center border-b border-cyan-500/10 px-2 pt-3 pb-1 text-xs text-slate-300">
            <p className="font-headline text-[16px] font-bold uppercase tracking-[0.15em] text-white text-left flex-1 m-0">SALIDA</p>
            <div className="flex-1 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setEdicionesIp({});
                  inputRefs.current = {};
                  setToastPuertos('op');
                }}
                className="rounded border border-cyan-700/45 bg-cyan-900/20 px-2 py-1 text-cyan-200"
              >
                Mostrar todos
              </button>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
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
          </div>
          {/* Título movido arriba */}
          <table className="w-full border-collapse text-center text-sm">
            <tbody>
              {puertosOpVisibles.map((puerto) => (
                <tr key={`op-${puerto}`} className="odd:bg-[#0a1626] even:bg-[#0f1d30]">
                  <td className="border-b border-cyan-500/10 px-2 py-2 font-code font-medium text-slate-400">OP{toHex2(puerto)}</td>
                  <td className="border-b border-cyan-500/10 px-2 py-2">
                    <HexDisplay value={toHex4(opPorts[puerto] ?? 0)} apagado={apagado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toastPuertos ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onClick={() => {
            setEdicionesIp({});
            inputRefs.current = {};
            setToastPuertos(null);
          }}
        >
          <div
            className="w-[min(96vw,860px)] overflow-hidden rounded-xl border border-cyan-500/20 bg-[#0b1526] shadow-[0_24px_70px_-28px_rgba(15,23,42,0.9)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 bg-[#111f31] px-3 py-2">
              <h3 className="font-headline text-sm font-semibold text-cyan-200">
                {toastEsEntrada ? 'Los 256 puertos de entrada (H00-HFF)' : 'Los 256 puertos de salida (H00-HFF)'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEdicionesIp({});
                  inputRefs.current = {};
                  setToastPuertos(null);
                }}
                className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
              >
                x
              </button>
            </div>

            <div className="max-h-[72vh] overflow-auto p-3">
              {toastEsEntrada ? (
                <p className="mb-2 text-xs text-cyan-300">Edita como memoria: escribes HEX y confirma con Enter, blur o al completar 4 digitos.</p>
              ) : (
                <p className="mb-2 text-xs text-slate-300">Los puertos de salida son de solo lectura.</p>
              )}

              <table className="w-full border-collapse text-center text-sm">
                <tbody>
                  {filasToast.map((grupo, idxFila) => (
                    <tr key={`fila-toast-${idxFila}`} className="odd:bg-[#0a1626] even:bg-[#0f1d30]">
                      {grupo.map((puerto) => {
                        const prefijo = toastEsEntrada ? 'IP' : 'OP';
                        const valor = toastEsEntrada ? ipPorts[puerto] ?? 0 : opPorts[puerto] ?? 0;
                        return [
                          <td key={`tag-${prefijo}-${puerto}`} className="border border-cyan-500/10 px-2 py-2 font-code font-medium text-cyan-200">{prefijo}{toHex2(puerto)}</td>,
                          <td
                            key={`val-${prefijo}-${puerto}`}
                            className="border border-cyan-500/10 px-2 py-2"
                          >
                            {toastEsEntrada ? (
                              <HexInput
                                value={edicionesIp[puerto] ?? toHex4(valor)}
                                apagado={apagado}
                                disabled={apagado}
                                inputRef={(el) => {
                                  if (el) {
                                    inputRefs.current[puerto] = el;
                                  }
                                }}
                                onChange={(nuevoValor) => {
                                  const valorActual = valor;
                                  const valorPrevio = edicionesIp[puerto] ?? toHex4(valor);
                                  edicionManualIpRef.current[puerto] = true;
                                  setEdicionesIp((prev) => ({ ...prev, [puerto]: nuevoValor }));

                                  if (nuevoValor.length === 4) {
                                    confirmarEdicionIp(puerto, valorActual, nuevoValor);

                                    if (valorPrevio.length < 4) {
                                      enfocarSiguientePuerto(puerto);
                                    }
                                  }
                                }}
                                onBlur={() => confirmarEdicionIp(puerto, valor)}
                                onCursorAfterLastDigit={() => {
                                  // La confirmación ya ocurre en onChange cuando hay 4 dígitos.
                                  enfocarSiguientePuerto(puerto);
                                }}
                                onKeyDown={(e) => {
                                  const pos = Math.max(0, Math.min(e.currentTarget.selectionStart ?? 0, 3));

                                  if (e.key === 'Enter') {
                                    confirmarEdicionIp(puerto, valor);
                                    e.currentTarget.blur();
                                  }
                                  if (e.key === 'Escape') {
                                    setEdicionesIp((prev) => ({ ...prev, [puerto]: toHex4(valor) }));
                                    edicionManualIpRef.current[puerto] = false;
                                    e.currentTarget.blur();
                                  }
                                  if (e.key === 'ArrowLeft' && pos === 0) {
                                    e.preventDefault();
                                    enfocarPuerto(puerto - 1, 3);
                                  }
                                  if (e.key === 'ArrowRight' && pos >= 3) {
                                    e.preventDefault();
                                    enfocarPuerto(puerto + 1, 0);
                                  }
                                  if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    enfocarPuerto(puerto - 1, pos);
                                  }
                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    enfocarPuerto(puerto + 1, pos);
                                  }
                                }}
                                className="mx-auto"
                              />
                            ) : (
                              <HexDisplay value={toHex4(valor)} apagado={apagado} />
                            )}
                          </td>,
                        ];
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
