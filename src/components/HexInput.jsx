export default function HexInput({
  id,
  value,
  onChange,
  onBlur,
  onKeyDown,
  disabled = false,
  apagado = false,
  placeholder = '0000',
  className = '',
}) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => {
        const limpio = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 4).toUpperCase();
        onChange(limpio);
      }}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={4}
      className={`block w-[96px] rounded border bg-black px-2 py-0.5 text-center font-mono text-lg tracking-wider outline-none disabled:opacity-40 mx-auto ${
        apagado
          ? 'border-slate-700/70 text-transparent placeholder:text-transparent'
          : 'border-lime-500/40 text-lime-300 placeholder:text-lime-700/70 focus:border-lime-400 focus:shadow-[0_0_12px_-4px_rgba(163,230,53,0.85)]'
      } ${className}`}
      inputMode="text"
      spellCheck={false}
      autoComplete="off"
    />
  );
}
