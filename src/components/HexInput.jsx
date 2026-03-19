export default function HexInput({
  id,
  value,
  onChange,
  onBlur,
  onKeyDown,
  onFocus,
  inputRef,
  disabled = false,
  apagado = false,
  placeholder = '0000',
  className = '',
}) {
  return (
    <input
      ref={inputRef}
      id={id}
      value={value}
      onChange={(e) => {
        const limpio = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 4).toUpperCase();
        onChange(limpio);
      }}
      onBlur={onBlur}
      onKeyDown={(e) => {
        const teclaHex = /^[0-9a-fA-F]$/.test(e.key);
        const modificador = e.ctrlKey || e.metaKey || e.altKey;

        // Si hay 4 digitos, escribir encima reemplaza el caracter en la posicion del cursor.
        if (teclaHex && !modificador && value.length === 4) {
          const inicio = e.currentTarget.selectionStart ?? 0;
          const fin = e.currentTarget.selectionEnd ?? inicio;
          const pos = Math.max(0, Math.min(inicio, 3));

          e.preventDefault();

          let nuevoValor;
          if (fin > inicio) {
            const base = value.slice(0, inicio) + e.key.toUpperCase() + value.slice(fin);
            nuevoValor = base.padEnd(4, '0').slice(0, 4);
          } else {
            nuevoValor = value.slice(0, pos) + e.key.toUpperCase() + value.slice(pos + 1);
          }

          onChange(nuevoValor);

          window.requestAnimationFrame(() => {
            const siguiente = Math.min(pos + 1, 4);
            e.currentTarget.setSelectionRange(siguiente, siguiente);
          });
          return;
        }

        onKeyDown?.(e);
      }}
      onFocus={onFocus}
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
