import { useEffect, useRef } from 'react';

export default function HexEditModal({
  abierto,
  titulo,
  etiqueta,
  valor,
  error,
  onChange,
  onConfirm,
  onCancel,
}) {
  const inputRef = useRef(null);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!abierto) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancelRef.current?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [abierto]);

  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-cyan-400/30 bg-slate-900 p-5 shadow-[0_20px_45px_-20px_rgba(34,211,238,0.45)]">
        <h3 className="text-lg font-semibold text-slate-100">{titulo}</h3>
        <p className="mt-1 text-sm text-slate-400">Ingrese un valor hexadecimal de 1 a 4 digitos.</p>

        <label className="mt-4 block text-xs font-semibold tracking-wide text-cyan-300" htmlFor="hex-input">
          {etiqueta}
        </label>
        <input
          id="hex-input"
          ref={inputRef}
          value={valor}
          onChange={(e) => {
            const inicio = e.target.selectionStart;
            const fin = e.target.selectionEnd;

            onChange(e.target.value.toUpperCase());

            window.requestAnimationFrame(() => {
              if (!inputRef.current || inicio == null || fin == null) {
                return;
              }

              inputRef.current.setSelectionRange(inicio, fin);
            });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onConfirm();
            }
          }}
          className="mt-1 w-full rounded-md border border-lime-500/40 bg-black px-3 py-2 font-mono text-base tracking-widest text-lime-300 outline-none placeholder:text-lime-700/70 focus:border-lime-400 focus:shadow-[0_0_12px_-4px_rgba(163,230,53,0.85)]"
          placeholder="0000"
          autoComplete="off"
        />

        <p className="mt-2 min-h-5 text-xs text-rose-300">{error || ' '}</p>

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
