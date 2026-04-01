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
  const [direccionBusqueda, setDireccionBusqueda] = useState("");
  const [errorBusqueda, setErrorBusqueda] = useState(false);
  const [navegacionManual, setNavegacionManual] = useState(false);
  const scrollRef = useRef(null);
  const filaActualRef = useRef(null);
  const inputRefs = useRef({});
  const edicionManualRef = useRef({});

  useEffect(() => {
    setEdiciones({});
    inputRefs.current = {};
  }, [resetEdicionesToken]);

  useEffect(() => {
    if (!resaltarEjecucion) return;
    if (pc < inicio || pc >= fin) return;
    if (!scrollRef.current) return;
    const filaActual = filaActualRef.current;
    if (filaActual) {
      const parent = scrollRef.current;
      const targetTop = filaActual.offsetTop - parent.clientHeight / 2 + filaActual.clientHeight / 2;
      parent.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });
    }
  }, [pc, inicio, fin, resaltarEjecucion]);

  // Permitir navegación manual siempre, pero al continuar ejecución volver al rango resaltado
  // Permitir navegación manual, pero si resaltarEjecucion está activo y el PC sale del rango, volver automáticamente
  // Permitir navegación manual siempre, pero al presionar continuar (resaltarEjecucion pase de false a true),
  // solo forzar el seguimiento automático si el PC está fuera del rango
  // Al presionar continuar, siempre forzar el rango resaltado si el PC está fuera del rango
  // El panel siempre sigue el PC: cambia de rango automáticamente si el PC sale del rango visible
  // Efecto para navegación automática: solo si no está en navegación manual
  useEffect(() => {
    if (!navegacionManual) {
      if (pc < inicio && onPrev) {
        onPrev(pc);
      } else if (pc >= fin && onNext) {
        onNext(pc);
      }
    }
  }, [pc, inicio, fin, onPrev, onNext, navegacionManual]);

  // Cuando se pulsa "Continuar" (resaltarEjecucion pasa de false a true), desactiva navegación manual
  const prevResaltarRef = useRef(resaltarEjecucion);
  useEffect(() => {
    if (!prevResaltarRef.current && resaltarEjecucion) {
      setNavegacionManual(false);
      // Si el PC está fuera del rango, forzar el cambio de rango
      if (pc < inicio && onPrev) {
        onPrev(pc);
      } else if (pc >= fin && onNext) {
        onNext(pc);
      }
    }
    prevResaltarRef.current = resaltarEjecucion;
  }, [resaltarEjecucion, pc, inicio, fin, onPrev, onNext]);

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
        <h2 className="font-headline text-sm font-semibold uppercase tracking-[0.12em] text-white">Memoria</h2>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setNavegacionManual(true);
              onPrev();
            }}
            className={`rounded border border-cyan-500/15 bg-[#101f34] px-2 py-1 hover:bg-[#14304d]${inicio === 0 ? ' opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
            disabled={inicio === 0}
          >
            {'<'}
          </button>
          <span className="font-code tracking-wider text-cyan-300">
            H{toHex(inicio, 4)} - H{toHex(fin - 1, 4)}
          </span>
          <button
            type="button"
            onClick={() => {
              setNavegacionManual(true);
              onNext();
            }}
            className={`rounded border border-cyan-500/15 bg-[#101f34] px-2 py-1 hover:bg-[#14304d]${fin >= 0x10000 ? ' opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
            disabled={fin >= 0x10000}
          >
            {'>'}
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2 rounded-md border border-cyan-500/10 bg-white/10 px-2 py-1.5">
        <input
          type="text"
          placeholder="Ir a dirección..."
          className={`font-code w-full bg-transparent text-[11px] uppercase tracking-[0.08em] outline-none ${errorBusqueda ? '!text-red-400 !border-red-400 !ring-1 !ring-red-400' : 'text-slate-200'}`}
          aria-label="Buscador de memoria"
          value={direccionBusqueda || ''}
          onChange={e => {
            const valor = e.target.value.trim().toUpperCase();
            setDireccionBusqueda(valor);
            // Validación en tiempo real: solo hex, máximo 4 dígitos
            if (valor.length > 4 || (valor && !/^[0-9A-F]{1,4}$/.test(valor))) {
              setErrorBusqueda(true);
            } else {
              setErrorBusqueda(false);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const valor = (direccionBusqueda || '').trim().toUpperCase();
              if (valor.length === 0 || valor.length > 4 || !/^[0-9A-F]{1,4}$/.test(valor)) {
                setErrorBusqueda(true);
                return;
              }
              setErrorBusqueda(false);
              // Solo permitir hex válido, no decimal
              const addr = /^[0-9A-F]{1,4}$/.test(valor) ? parseInt(valor, 16) : NaN;
              if (isNaN(addr) || addr < 0 || addr > 0xFFFF) {
                setErrorBusqueda(true);
                return;
              }
              // Si la dirección está fuera del rango visible, llama a onPrev/onNext con el nuevo inicio
              if ((addr < inicio || addr >= fin) && (onPrev || onNext)) {
                // Se asume que onPrev y onNext aceptan un parámetro opcional para ir a un inicio específico
                if (addr < inicio && onPrev) {
                  onPrev(addr);
                } else if (addr >= fin && onNext) {
                  onNext(addr);
                }
              }
              // Enfoca la celda si está visible
              setTimeout(() => {
                const input = inputRefs.current[addr];
                if (input) {
                  input.focus();
                  input.setSelectionRange(0, 1); // Selecciona solo el primer dígito
                }
              }, 150);
            }
          }}
        />
        <span
          className={`material-symbols-outlined text-sm cursor-pointer transition-colors ${errorBusqueda ? 'text-red-400' : 'text-slate-500 hover:text-cyan-400'}`}
          tabIndex={0}
          role="button"
          aria-label="Buscar dirección de memoria"
          onClick={() => {
            setNavegacionManual(true);
            const valor = (direccionBusqueda || '').trim().toUpperCase();
            if (valor.length === 0 || valor.length > 4 || !/^[0-9A-F]{1,4}$/.test(valor)) {
              setErrorBusqueda(true);
              return;
            }
            setErrorBusqueda(false);
            // Solo permitir hex válido, no decimal
            const addr = /^[0-9A-F]{1,4}$/.test(valor) ? parseInt(valor, 16) : NaN;
            if (isNaN(addr) || addr < 0 || addr > 0xFFFF) {
              setErrorBusqueda(true);
              return;
            }
            // Si la dirección está fuera del rango visible, llama a onPrev/onNext con el nuevo inicio
            if ((addr < inicio || addr >= fin) && (onPrev || onNext)) {
              if (addr < inicio && onPrev) {
                onPrev(addr);
              } else if (addr >= fin && onNext) {
                onNext(addr);
              }
            }
            // Enfoca la celda si está visible
            setTimeout(() => {
              const input = inputRefs.current[addr];
              if (input) {
                input.focus();
                input.setSelectionRange(0, 1);
              }
            }, 150);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              setNavegacionManual(true);
              e.preventDefault();
              const valor = (direccionBusqueda || '').trim().toUpperCase();
              if (valor.length === 0 || valor.length > 4 || !/^[0-9A-F]{1,4}$/.test(valor)) {
                setErrorBusqueda(true);
                return;
              }
              setErrorBusqueda(false);
              const addr = /^[0-9A-F]{1,4}$/.test(valor) ? parseInt(valor, 16) : NaN;
              if (isNaN(addr) || addr < 0 || addr > 0xFFFF) {
                setErrorBusqueda(true);
                return;
              }
              if ((addr < inicio || addr >= fin) && (onPrev || onNext)) {
                if (addr < inicio && onPrev) {
                  onPrev(addr);
                } else if (addr >= fin && onNext) {
                  onNext(addr);
                }
              }
              setTimeout(() => {
                const input = inputRefs.current[addr];
                if (input) {
                  input.focus();
                  input.setSelectionRange(0, 1);
                }
              }, 150);
            }
          }}
        >search</span>
      </div>

      <div ref={scrollRef} className="max-h-[28rem] overflow-auto rounded-lg bg-transparent xl:max-h-none xl:min-h-0">
        <table className="w-full border-collapse text-center text-xs">
          <thead className="sticky top-0 z-10 bg-[#111f31]">
            <tr className="font-headline text-[9px] uppercase tracking-[0.12em] text-white">
              <th className="border-b border-cyan-500/10 px-2 py-2">Dirección</th>
              <th className="border-b border-cyan-500/10 px-2 py-2">Valor</th>
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
                  className={esActual ? 'bg-fuchsia-400/20' : 'odd:bg-white/0 even:bg-white/0'}
                >
                  <td className="border-b border-cyan-500/10 px-2 py-1.5 font-code tracking-wider text-cyan-300 text-center">
                    H{toHex(indexAbsoluto, 4)}
                  </td>
                  <td
                    className="border-b border-cyan-500/10 px-1 py-1 text-center"
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
                      className={`mx-auto !w-full !max-w-[104px] !rounded-md !border-cyan-500/20 bg-white/5 !text-center !font-code !text-sm !tracking-wide !shadow-none disabled:!opacity-100 sm:!text-base ${
                        '!text-amber-400 focus:!border-amber-400 focus:!shadow-[0_0_0_1px_rgba(251,191,36,0.35)]'
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
