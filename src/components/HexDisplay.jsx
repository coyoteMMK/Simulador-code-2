export default function HexDisplay({ value, className = '', apagado = false }) {
  const estadoClase = apagado
    ? 'border-slate-700/70 bg-slate-900 text-transparent'
    : 'border-lime-500/40 bg-black text-lime-400';
  const valorVisual = apagado ? (String(value || '0000').padEnd(4, '0').slice(0, 4)) : value;

  return (
    <span className={`block w-[96px] rounded border px-2 py-0.5 text-center font-mono text-lg tracking-wider mx-auto ${estadoClase} ${className}`}>
      {valorVisual || '0000'}
    </span>
  );
}
