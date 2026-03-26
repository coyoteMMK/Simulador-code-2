export default function InstructionsTerminal({ codigo, className = '' }) {
  const lineas = codigo.split('\n');

  return (
    <article className={`flex flex-col rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 p-4 min-h-0 h-full w-full ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-headline text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">Instrucciones</h2>
        <span className="material-symbols-outlined text-sm text-slate-500">info</span>
      </div>
      <div className="font-code flex-1 overflow-y-auto text-[11px] leading-relaxed">
        {lineas.length === 0 ? (
          <div className="mt-4 text-center text-slate-500">
            No hay instrucciones cargadas
          </div>
        ) : (
          lineas.map((linea, idx) => {
            const isHighlighted = linea.startsWith('>>>');
            const display = linea.replace(/^>>>/, '');

            return (
              <div
                key={idx}
                className={`mb-1.5 flex gap-3 ${
                  isHighlighted
                    ? 'mx-[-0.75rem] border-l-2 border-cyan-300 bg-cyan-500/12 px-3 py-1'
                    : 'opacity-65 transition-opacity hover:opacity-100'
                }`}
              >
                <span className={isHighlighted ? 'text-cyan-300' : 'text-slate-500'}>
                  {String(idx + 1).padStart(4, '0')}
                </span>
                <span className={isHighlighted ? 'font-semibold text-slate-100' : 'text-lime-300'}>
                  {display}
                </span>
                {isHighlighted && (
                  <span className="material-symbols-outlined ml-auto text-xs text-cyan-300">
                    arrow_right_alt
                  </span>
                )}
              </div>
            );
          })
        )}
        <div className="mt-4 text-[9px] uppercase tracking-[0.2em] text-slate-600 italic">
          -- System kernel processing instructions --
        </div>
      </div>
    </article>
  );
}
