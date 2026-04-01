export default function HexDisplay({ value, className = '', apagado = false }) {
  const estadoClase = apagado
    ? 'border-cyan-500/10 bg-black/50 text-transparent'
    : 'border-cyan-500/20 bg-black/60 text-lime-300';

  return (
    <span className={`font-code mx-auto block w-full max-w-[96px] rounded border px-2 py-0.5 text-center text-base tracking-wider sm:text-lg ${estadoClase} ${className}`}>
      {apagado ? (
        <span style={{visibility:'hidden'}}>0000</span>
      ) : (
        value || '0000'
      )}
    </span>
  );
}
