
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

export default function InstructionsTerminal({ codigo, className = '', lastAction, resaltarEjecucion = false, pcActual = null }) {
  // Mantener el último código no vacío para evitar borrar la terminal si solo cambia el encendido/apagado
  const [codigoMostrado, setCodigoMostrado] = useState(codigo && codigo.trim() ? codigo : lastNonEmptyCodigo);
  const [activeLine, setActiveLine] = useState(null);
  const lineas = codigoMostrado.split('\n');
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  // Detectar la línea activa (la que tiene >>>)
  useEffect(() => {
    // Buscar la línea cuyo número de instrucción coincide con el PC actual (tenga o no >>>)
    let foundIdx = -1;
    if (pcActual !== null) {
      for (let i = 0; i < lineas.length; i++) {
        const m = lineas[i].match(/\[([0-9A-Fa-f]{4})\]/);
        if (m && parseInt(m[1], 16) === pcActual) {
          foundIdx = i;
          break;
        }
      }
    }
    setActiveLine(prev => {
      if (foundIdx !== -1) {
        return prev === foundIdx ? prev : foundIdx;
      } else {
        return null;
      }
    });
    lastActiveLine = foundIdx !== -1 ? foundIdx : null;
  }, [codigoMostrado, lineas.length, pcActual]);

  // Limpiar línea activa si la acción no es continuar ni ejecutar
  useEffect(() => {
    if (lastAction && lastAction !== 'Continuar' && lastAction !== 'Ejecutar') {
      setActiveLine(null);
      lastActiveLine = null;
    }
  }, [lastAction]);

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
    if (!resaltarEjecucion) {
      return;
    }

    if (activeRef.current && scrollRef.current) {
      const parent = scrollRef.current;
      const child = activeRef.current;
      const parentRect = parent.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      const targetTop =
        childRect.top - parentRect.top + parent.scrollTop - parent.clientHeight / 2 + childRect.height / 2;

      parent.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });
    }
  }, [activeLine, codigoMostrado, resaltarEjecucion]);

  return (
    <article className={`flex flex-col rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 p-4 min-h-0 w-full max-h-[28rem] ${className} ${typeof apagado !== 'undefined' && apagado ? 'opacity-50 grayscale pointer-events-none select-none' : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-headline text-sm font-semibold uppercase tracking-[0.12em] text-white">Instrucciones</h2>
      </div>
      <div ref={scrollRef} className="font-code min-h-0 flex-1 overflow-y-auto text-[15px] leading-relaxed">
        {lineas.length === 0 ? (
          <div className="mt-4 text-center text-slate-500">
            No hay instrucciones cargadas
          </div>
        ) : (
          lineas.map((linea, idx) => {
            // Resaltar si es la línea activa (la que coincide con el PC), aunque no tenga >>>
            let isActive = activeLine !== null && idx === activeLine;
            let display = linea.replace(/^>>>/, '');
            const ref = isActive && resaltarEjecucion ? activeRef : null;
            return (
              <div
                key={idx}
                ref={ref}
                className={`mb-1.5 flex items-center px-2 py-1 rounded transition-all ${
                  isActive && resaltarEjecucion
                    ? 'bg-fuchsia-400/20 font-semibold text-fuchsia-300 gap-3'
                    : 'text-cyan-200 opacity-80 hover:opacity-100 gap-2'
                }`}
              >
                {isActive && resaltarEjecucion && (
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
