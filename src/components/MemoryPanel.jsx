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

    if (!/^[0-9a-fA-F]{1,4}$/.test(sinPrefijo)) {
      setEdiciones((prev) => ({ ...prev, [index]: toHex(valorActual, 4) }));
      onFormatoInvalido?.();
      return;
    }

    const valor = parseInt(sinPrefijo, 16) & 0xffff;
    onEditMemoria(index, valor);

    // Normaliza visualmente a 4 hex
    setEdiciones((prev) => ({ ...prev, [index]: toHex(valor, 4) }));
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
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Memoria</h2>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={onPrev}
            className="rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
          >
            {'<'}
          </button>
          <span className="font-mono tracking-wider text-cyan-200">
            H{toHex(inicio, 4)} - H{toHex(fin - 1, 4)}
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

      <div ref={scrollRef} className="max-h-[28rem] overflow-auto rounded-lg border border-slate-700">
        <table className="w-full border-collapse text-center text-sm">
          <tbody>
            {bloqueMemoria.map((valor, i) => {
              const indexAbsoluto = inicio + i;
              const esActual = resaltarEjecucion && indexAbsoluto === pc;
              return (
                <tr
                  key={indexAbsoluto}
                  ref={esActual ? filaActualRef : null}
                  className={esActual ? 'bg-amber-300 text-slate-900' : 'odd:bg-slate-900 even:bg-slate-800/60'}
                >
                  <td className="border border-slate-700 px-3 py-2 font-mono tracking-wider text-cyan-200">
                    H{toHex(indexAbsoluto, 4)}
                  </td>
                  <td
                    className="border border-slate-700 px-2 py-1"
                  >
                    <HexInput
                      value={ediciones[indexAbsoluto] ?? toHex(valor, 4)}
                      apagado={apagado}
                      inputRef={(el) => {
                        if (el) {
                          inputRefs.current[indexAbsoluto] = el;
                        }
                      }}
                      onChange={(nuevoValor) => {
                        const valorPrevio = ediciones[indexAbsoluto] ?? toHex(valor, 4);

                        setEdiciones((prev) => ({
                          ...prev,
                          [indexAbsoluto]: nuevoValor,
                        }));

                        if (valorPrevio.length < 4 && nuevoValor.length === 4) {
                          confirmarEdicion(indexAbsoluto, valor, nuevoValor);
                          enfocarSiguienteCelda(indexAbsoluto);
                        }
                      }}
                      onBlur={() => confirmarEdicion(indexAbsoluto, valor)}
                      onCursorAfterLastDigit={(nuevoValor) => {
                        confirmarEdicion(indexAbsoluto, valor, nuevoValor);
                        enfocarSiguienteCelda(indexAbsoluto);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          confirmarEdicion(indexAbsoluto, valor);
                          e.currentTarget.blur();
                        }
                        if (e.key === 'Escape') {
                          setEdiciones((prev) => ({ ...prev, [indexAbsoluto]: toHex(valor, 4) }));
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
                      }}
                      className="mx-auto"
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
