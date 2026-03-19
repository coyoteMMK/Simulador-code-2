import { useLayoutEffect, useRef } from 'react';

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
  onCursorAfterLastDigit,
}) {
  const localInputRef = useRef(null);
  const pendingSelectionRef = useRef(null);
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const seleccionPendiente = pendingSelectionRef.current;
    const input = localInputRef.current;

    if (!seleccionPendiente || !input || document.activeElement !== input) {
      return;
    }

    input.setSelectionRange(seleccionPendiente.start, seleccionPendiente.end);
    pendingSelectionRef.current = null;
  }, [value]);

  const calcularPosicionClick = (input, clientX, texto) => {
    const rect = input.getBoundingClientRect();
    const estilos = window.getComputedStyle(input);
    const paddingIzq = Number.parseFloat(estilos.paddingLeft) || 0;
    const paddingDer = Number.parseFloat(estilos.paddingRight) || 0;

    const contenidoIzq = rect.left + paddingIzq;
    const contenidoAncho = Math.max(1, rect.width - paddingIzq - paddingDer);

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const contexto = canvasRef.current.getContext('2d');
    if (!contexto) {
      return 0;
    }

    const fuente = estilos.font && estilos.font !== 'normal' ? estilos.font : `${estilos.fontStyle} ${estilos.fontVariant} ${estilos.fontWeight} ${estilos.fontSize} / ${estilos.lineHeight} ${estilos.fontFamily}`;
    contexto.font = fuente;

    const textoRender = (texto || '0000').padEnd(4, '0').slice(0, 4);
    const anchoTexto = Math.max(1, contexto.measureText(textoRender).width);

    let inicioTexto = contenidoIzq;
    const alineacion = estilos.textAlign;
    if (alineacion === 'center') {
      inicioTexto = contenidoIzq + (contenidoAncho - anchoTexto) / 2;
    } else if (alineacion === 'right' || alineacion === 'end') {
      inicioTexto = contenidoIzq + (contenidoAncho - anchoTexto);
    }

    const xAjustada = Math.min(Math.max(clientX, inicioTexto), inicioTexto + anchoTexto);
    const anchoDigito = anchoTexto / 4;
    const posicion = Math.floor((xAjustada - inicioTexto) / anchoDigito);
    return Math.max(0, Math.min(posicion, 3));
  };

  const manejarTeclasNavegacion = (e) => {
    const moverSeleccion = (inicio, fin) => {
      pendingSelectionRef.current = { start: inicio, end: fin };
      e.currentTarget.setSelectionRange(inicio, fin);
    };

    // Backspace: mover hacia la izquierda dentro del input
    if (e.key === 'Backspace') {
      if (value.length !== 4) {
        return;
      }

      e.preventDefault();

      const pos = e.currentTarget.selectionStart ?? 0;
      if (pos > 0) {
        const anterior = pos - 1;
        moverSeleccion(anterior, anterior + 1);
      } else {
        moverSeleccion(0, 1);
      }
      return;
    }

    // Delete: mover hacia la izquierda dentro del input
    if (e.key === 'Delete') {
      if (value.length !== 4) {
        return;
      }

      e.preventDefault();

      const pos = e.currentTarget.selectionStart ?? 0;
      if (pos > 0) {
        const anterior = pos - 1;
        moverSeleccion(anterior, anterior + 1);
      } else {
        moverSeleccion(0, 1);
      }
      return;
    }

    // Flecha izquierda: moverse dentro del input, o cambiar a celda anterior
    if (e.key === 'ArrowLeft') {
      if (value.length !== 4) {
        return;
      }

      const pos = e.currentTarget.selectionStart ?? 0;
      if (pos > 0) {
        e.preventDefault();
        const anterior = pos - 1;
        moverSeleccion(anterior, anterior + 1);
      } else {
        // En el inicio, permitir que se vaya a la celda anterior
        onKeyDown?.(e);
      }
      return;
    }

    // Flecha derecha: moverse dentro del input, o cambiar a celda siguiente
    if (e.key === 'ArrowRight') {
      if (value.length !== 4) {
        return;
      }

      const pos = e.currentTarget.selectionStart ?? 0;
      if (pos < 3) {
        e.preventDefault();
        const siguiente = pos + 1;
        moverSeleccion(siguiente, siguiente + 1);
      } else {
        // Al final, permitir que se vaya a la celda siguiente
        onKeyDown?.(e);
      }
      return;
    }

    // Flecha arriba/abajo: no hacer nada
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      return;
    }
  };

  return (
    <input
      ref={(el) => {
        localInputRef.current = el;

        if (typeof inputRef === 'function') {
          inputRef(el);
        } else if (inputRef && typeof inputRef === 'object') {
          inputRef.current = el;
        }
      }}
      id={id}
      value={value}
      onChange={(e) => {
        const limpio = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 4).toUpperCase();
        onChange(limpio);
      }}
      onBlur={onBlur}
      onKeyDown={(e) => {
        // Primero manejar navegación (flechas, backspace, delete)
        manejarTeclasNavegacion(e);
        if (e.defaultPrevented) {
          return;
        }

        const teclaHex = /^[0-9a-fA-F]$/.test(e.key);
        const modificador = e.ctrlKey || e.metaKey || e.altKey;

        // Ignora cualquier tecla imprimible que no sea hexadecimal.
        if (!modificador && e.key.length === 1 && !teclaHex) {
          e.preventDefault();
          return;
        }

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
          const siguiente = Math.min(pos + 1, 4);

          if (siguiente < 4) {
            pendingSelectionRef.current = { start: siguiente, end: siguiente + 1 };
          }

          if (pos === 3) {
            onCursorAfterLastDigit?.(nuevoValor);
          }
          return;
        }

        onKeyDown?.(e);
      }}
      onMouseDown={(e) => {
        if (disabled || value.length !== 4) {
          return;
        }

        e.preventDefault();
        const posicion = calcularPosicionClick(e.currentTarget, e.clientX, value);
        e.currentTarget.focus();
        e.currentTarget.setSelectionRange(posicion, posicion + 1);
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
