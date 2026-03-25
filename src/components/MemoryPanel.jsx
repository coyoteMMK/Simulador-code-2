import { useEffect, useRef, useState } from 'react';
import { toHex } from '../simulator/core';
import HexInput from './HexInput';

export default function MemoryPanel({
  inicio,
  fin,
  bloqueMemoria,
  pc,
  resaltarEjecucion,
  apagado,
  resetEdicionesToken = 0,
  onEditMemoria,
  onFormatoInvalido,
  onPrev,
  onNext,
}) {
  // Solo guarda ediciones manuales del usuario (no "copia" bloqueMemoria)
  const [ediciones, setEdiciones] = useState({});
  const scrollRef = useRef(null);
  const filaActualRef = useRef(null);
  const inputRefs = useRef({});
  const edicionManualRef = useRef({});

  useEffect(() => {
    setEdiciones({});
    inputRefs.current = {};
  }, [resetEdicionesToken]);

  useEffect(() => {
    if (!resaltarEjecucion) {
      return;
    }

    if (pc < inicio || pc >= fin) {
      return;
    }

    const contenedor = scrollRef.current;
    const filaActual = filaActualRef.current;

    if (!contenedor || !filaActual) {
      return;
    }

    const objetivo =
      filaActual.offsetTop - contenedor.clientHeight / 2 + filaActual.clientHeight / 2;

    contenedor.scrollTop = Math.max(0, objetivo);
  }, [pc, inicio, fin, resaltarEjecucion]);

  const textoCelda = (index, valorActual) =>
    ediciones[index] ?? toHex(valorActual, 4);

  const confirmarEdicion = (index, valorActual, textoForzado) => {
    const texto = (textoForzado ?? textoCelda(index, valorActual)).trim();
    const sinPrefijo = texto.toLowerCase().startsWith('0x') ? texto.slice(2) : texto;
    const valorHexActual = toHex(valorActual, 4);
    const huboEdicionManual = Boolean(edicionManualRef.current[index]);

    // Si no hubo cambio real, no guardar ni notificar nada.
    if (/^[0-9a-fA-F]{1,4}$/.test(sinPrefijo)) {
      const valorSinCambios = parseInt(sinPrefijo, 16) & 0xffff;
      if (!huboEdicionManual && valorSinCambios === (valorActual & 0xffff)) {
        setEdiciones((prev) => {
          if (!(index in prev)) {
            return prev;
          }
          const siguiente = { ...prev };
          delete siguiente[index];
          return siguiente;
        });
        edicionManualRef.current[index] = false;
        return;
      }
    }

    if (!/^[0-9a-fA-F]{1,4}$/.test(sinPrefijo)) {
      setEdiciones((prev) => ({ ...prev, [index]: valorHexActual }));
      onFormatoInvalido?.();
      edicionManualRef.current[index] = false;
      return;
    }

    const valor = parseInt(sinPrefijo, 16) & 0xffff;
    onEditMemoria(index, valor);

    // Normaliza visualmente a 4 hex
    setEdiciones((prev) => ({ ...prev, [index]: toHex(valor, 4) }));
    edicionManualRef.current[index] = false;
  };

  const enfocarSiguienteCelda = (indexActual) => {
    const siguiente = indexActual + 1;
    if (siguiente >= fin) {
      return;
    }

    window.requestAnimationFrame(() => {
      const input = inputRefs.current[siguiente];
      if (input) {
        input.focus();
        input.setSelectionRange(0, 1);
      }
    });
  };

  return (
    <article className="flex h-full w-full min-h-0 flex-col rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-headline text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">Memoria</h2>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onPrev}
            className="rounded border border-cyan-500/15 bg-[#101f34] px-2 py-1 hover:bg-[#14304d]"
          >
            {'<'}
          </button>
          <span className="font-code tracking-wider text-cyan-200">
            H{toHex(inicio, 4)} - H{toHex(fin - 1, 4)}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="rounded border border-cyan-500/15 bg-[#101f34] px-2 py-1 hover:bg-[#14304d]"
          >
            {'>'}
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2 rounded-md border border-cyan-500/10 bg-black/30 px-2 py-1.5">
        <input
          type="text"
          value="goto addr..."
          readOnly
          className="font-code w-full bg-transparent text-[11px] uppercase tracking-[0.08em] text-slate-500 outline-none"
          aria-label="Buscador de memoria"
        />
        <span className="material-symbols-outlined text-sm text-slate-500">search</span>
      </div>

      <div ref={scrollRef} className="max-h-[28rem] overflow-auto rounded-lg   bg-black/20 xl:max-h-none xl:min-h-0">
        <table className="w-full border-collapse text-center text-xs">
          <thead className="sticky top-0 z-10 bg-[#111f31]">
            <tr className="font-headline text-[9px] uppercase tracking-[0.12em] text-slate-500">
              <th className="border-b border-cyan-500/10 px-2 py-2">Address</th>
              <th className="border-b border-cyan-500/10 px-2 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {bloqueMemoria.map((valor, i) => {
              const indexAbsoluto = inicio + i;
              const esActual = resaltarEjecucion && indexAbsoluto === pc;
              return (
                <tr
                  key={indexAbsoluto}
                  ref={esActual ? filaActualRef : null}
                  className={esActual ? 'bg-cyan-400/18' : 'odd:bg-[#0a1626] even:bg-[#0d1a2b]'}
                >
                  <td className="border-b border-cyan-500/10 px-2 py-1.5 font-code tracking-wider text-slate-400">
                    H{toHex(indexAbsoluto, 4)}
                  </td>
                  <td
                    className="border-b border-cyan-500/10 px-1 py-1"
                  >
                    <HexInput
                      value={ediciones[indexAbsoluto] ?? toHex(valor, 4)}
                      apagado={false}
                      inputRef={(el) => {
                        if (el) {
                          inputRefs.current[indexAbsoluto] = el;
                        }
                      }}
                      onChange={(nuevoValor) => {
                        const valorPrevio = ediciones[indexAbsoluto] ?? toHex(valor, 4);
                        edicionManualRef.current[indexAbsoluto] = true;

                        setEdiciones((prev) => ({
                          ...prev,
                          [indexAbsoluto]: nuevoValor,
                        }));

                        if (nuevoValor.length === 4) {
                          confirmarEdicion(indexAbsoluto, valor, nuevoValor);

                          // Solo avanza automáticamente al completar desde menos de 4 dígitos.
                          if (valorPrevio.length < 4) {
                            enfocarSiguienteCelda(indexAbsoluto);
                          }
                        }
                      }}
                      onBlur={() => confirmarEdicion(indexAbsoluto, valor)}
                      onCursorAfterLastDigit={(nuevoValor) => {
                        // La confirmación ya ocurre en onChange cuando hay 4 dígitos.
                        enfocarSiguienteCelda(indexAbsoluto);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          confirmarEdicion(indexAbsoluto, valor);
                          e.currentTarget.blur();
                        }
                        if (e.key === 'Escape') {
                          setEdiciones((prev) => ({ ...prev, [indexAbsoluto]: toHex(valor, 4) }));
                          edicionManualRef.current[indexAbsoluto] = false;
                          e.currentTarget.blur();
                        }
                        if (e.key === 'ArrowLeft') {
                          const pos = e.currentTarget.selectionStart ?? 0;
                          if (pos > 0) {
                            return;
                          }

                          e.preventDefault();
                          const anterior = indexAbsoluto - 1;
                          if (anterior >= inicio) {
                            const inputAnterior = inputRefs.current[anterior];
                            if (inputAnterior) {
                              inputAnterior.focus();
                              inputAnterior.setSelectionRange(3, 4);
                            }
                          }
                        }
                        if (e.key === 'ArrowRight') {
                          const pos = e.currentTarget.selectionStart ?? 0;
                          if (pos < 3) {
                            return;
                          }

                          e.preventDefault();
                          const siguiente = indexAbsoluto + 1;
                          if (siguiente < fin) {
                            const inputSiguiente = inputRefs.current[siguiente];
                            if (inputSiguiente) {
                              inputSiguiente.focus();
                              inputSiguiente.setSelectionRange(0, 1);
                            }
                          }
                        }
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          const pos = Math.max(0, Math.min(e.currentTarget.selectionStart ?? 0, 3));
                          const anterior = indexAbsoluto - 1;
                          if (anterior >= inicio) {
                            const inputAnterior = inputRefs.current[anterior];
                            if (inputAnterior) {
                              inputAnterior.focus();
                              inputAnterior.setSelectionRange(pos, pos + 1);
                            }
                          }
                        }
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          const pos = Math.max(0, Math.min(e.currentTarget.selectionStart ?? 0, 3));
                          const siguiente = indexAbsoluto + 1;
                          if (siguiente < fin) {
                            const inputSiguiente = inputRefs.current[siguiente];
                            if (inputSiguiente) {
                              inputSiguiente.focus();
                              inputSiguiente.setSelectionRange(pos, pos + 1);
                            }
                          }
                        }
                      }}
                      className={`mx-auto !w-[104px] !rounded-md !border-cyan-500/20 !bg-black/60 !text-center !font-code !text-base !tracking-wide !shadow-none disabled:!opacity-100 ${
                        apagado ? '!text-slate-500' : '!text-lime-300 focus:!border-cyan-400 focus:!shadow-[0_0_0_1px_rgba(34,211,238,0.35)]'
                      }`}
                    />
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
