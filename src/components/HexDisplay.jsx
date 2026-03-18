export default function HexDisplay({ value, className = '', apagado = false }) {
  const estadoClase = apagado
    ? 'border-slate-700/70 bg-slate-900 text-slate-500'
    : 'border-lime-500/40 bg-black text-lime-400';

  return (
    <span className={`inline-block min-w-[96px] rounded border px-3 py-1 text-center font-mono text-2xl tracking-wider ${estadoClase} ${className}`}>
      {value}
    </span>
  );
}
