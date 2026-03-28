
import { useEffect, useRef, useState } from 'react';

let lastNonEmptyCodigo = '';
let lastActiveLine = null;

// Detectar si la limpieza es por inicialización de memoria
function isMemoryInit(codigo) {
  // Puedes ajustar este criterio según cómo se envíe el código tras inicializar memoria
  // Por ejemplo, si el string es vacío y hay una prop especial, o si el código es '' tras reset
  // Aquí simplemente se asume que si es '' y no hay instrucciones, es por inicialización
  return codigo === '';
}

export default function InstructionsTerminal({ codigo, className = '' }) {
  // Mantener el último código no vacío para evitar borrar la terminal si solo cambia el encendido/apagado
  const [codigoMostrado, setCodigoMostrado] = useState(codigo && codigo.trim() ? codigo : lastNonEmptyCodigo);
  const [activeLine, setActiveLine] = useState(null);
  const lineas = codigoMostrado.split('\n');
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  // Detectar la línea activa (la que tiene >>>)
  useEffect(() => {
    const idx = lineas.findIndex(l => l.startsWith('>>>'));
    if (idx !== -1) {
      setActiveLine(idx);
      lastActiveLine = idx;
    } else if (lastActiveLine !== null && lastActiveLine < lineas.length) {
      // Si la línea activa desapareció pero el código cambió, mantener el scroll en la última línea activa si existe
      // pero solo si el usuario no ha dado a ejecutar (es decir, si el código no cambió completamente)
      // Si el código cambió completamente (ejecutar), limpiar el indicador
      setActiveLine(null);
      lastActiveLine = null;
    }
  }, [codigoMostrado]);

  useEffect(() => {
    if (codigo && codigo.trim()) {
      setCodigoMostrado(codigo);
      lastNonEmptyCodigo = codigo;
    } else if (isMemoryInit(codigo)) {
      // Si el código es vacío y es por inicialización de memoria, limpiar terminal
      setCodigoMostrado('');
      lastNonEmptyCodigo = '';
      lastActiveLine = null;
    }
    // Si el código es vacío pero no es por inicialización, no lo actualizamos (no borramos la terminal)
  }, [codigo]);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const parent = scrollRef.current;
      const child = activeRef.current;
      const parentRect = parent.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      if (childRect.top < parentRect.top || childRect.bottom > parentRect.bottom) {
        child.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLine, codigoMostrado]);

  return (
    <article className={`flex flex-col rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 p-4 min-h-0 h-full w-full ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-headline text-sm font-semibold uppercase tracking-[0.12em] text-white">Instrucciones</h2>
      </div>
      <div ref={scrollRef} className="font-code flex-1 overflow-y-auto text-[15px] leading-relaxed">
        {lineas.length === 0 ? (
          <div className="mt-4 text-center text-slate-500">
            No hay instrucciones cargadas
          </div>
        ) : (
          lineas.map((linea, idx) => {
            // Solo resaltar si la línea tiene '>>>' o es la activa (si existe)
            let isHighlighted = linea.startsWith('>>>') || (activeLine !== null && idx === activeLine);
            // Si no hay línea activa, no forzar '>>>'
            if (activeLine === null) isHighlighted = linea.startsWith('>>>');
            let display = linea.replace(/^>>>/, '');
            const ref = isHighlighted ? activeRef : null;
            return (
              <div
                key={idx}
                ref={ref}
                className={`mb-1.5 flex items-center px-2 py-1 rounded transition-all ${
                  isHighlighted
                    ? 'bg-fuchsia-400/20 font-semibold text-fuchsia-300 gap-3'
                    : 'text-cyan-200 opacity-80 hover:opacity-100 gap-2'
                }`}
              >
                {isHighlighted && (
                  <span className="material-symbols-outlined text-lg text-fuchsia-400 mr-1">arrow_right_alt</span>
                )}
                <span>{display}</span>
              </div>
            );
          })
        )}
        <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 italic">
          -- System kernel processing instructions --
        </div>
      </div>
    </article>
  );
}
