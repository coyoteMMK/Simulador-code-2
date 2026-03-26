import HexDisplay from './HexDisplay';

export default function CpuStatusPanel({ irActualHex, pcActualHex, flags, onToggleFlag, apagado }) {
  return (
    <article className="flex flex-col rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 p-4 w-full mb-4 gap-4 items-stretch">
      <h2 className="font-headline text-sm font-semibold uppercase tracking-[0.12em] text-white mb-2 text-left">CPU Status</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* IR */}
        <div className="flex flex-col items-center bg-[#101d2f] border border-cyan-500/10 rounded-lg p-3">
          <span className="font-headline text-xs font-semibold uppercase tracking-[0.11em] text-cyan-300 mb-1">IR</span>
          <HexDisplay value={irActualHex} apagado={apagado} className="!font-code !text-lime-300 text-center" />
        </div>
        {/* PC */}
        <div className="flex flex-col items-center bg-[#101d2f] border border-cyan-500/10 rounded-lg p-3">
          <span className="font-headline text-xs font-semibold uppercase tracking-[0.11em] text-cyan-300 mb-1">PC</span>
          <HexDisplay value={pcActualHex} apagado={apagado} className="!font-code !text-lime-300 text-center" />
        </div>
      </div>
      {/* Flags en una sola fila */}
      <div className="mt-4 flex flex-row items-center justify-center gap-6 bg-[#0d182a]/80 border border-cyan-500/10 rounded-lg py-3">
        {[
          { name: 'Z', value: flags.z },
          { name: 'S', value: flags.s },
          { name: 'C', value: flags.c },
          { name: 'V', value: flags.v },
        ].map((flag) => (
          <div key={flag.name} className="flex flex-col items-center gap-1">
            <span className="font-headline text-xs font-semibold text-cyan-300 mb-0.5">{flag.name}</span>
            <button
              type="button"
              onClick={() => onToggleFlag && onToggleFlag(flag.name.toLowerCase())}
              disabled={apagado}
              className={`w-8 h-8 flex items-center justify-center rounded bg-black border border-cyan-500/20 font-code text-base transition-all shadow ${
                flag.value
                  ? 'bg-lime-200 text-black border-lime-400 shadow-[0_0_10px_2px_#eaff7a88]' 
                  : 'text-lime-300'
              }`}
              style={flag.value ? {boxShadow:'0 0 12px 1px #eaff7a88', background:'#eaff7a', color:'#222'} : {}}
            >
              {flag.value ? 1 : 0}
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}
