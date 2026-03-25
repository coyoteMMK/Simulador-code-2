export default function HexDisplay({ value, className = '', apagado = false }) {
  const estadoClase = apagado
    ? 'border-cyan-500/10 bg-black/50 text-transparent'
    : 'border-cyan-500/20 bg-black/60 text-lime-300';
  const valorVisual = apagado ? (String(value || '0000').padEnd(4, '0').slice(0, 4)) : value;

  return (
    <span className={`font-code mx-auto block w-[96px] rounded border px-2 py-0.5 text-center text-lg tracking-wider ${estadoClase} ${className}`}>
      {valorVisual || '0000'}
    </span>
  );
}
