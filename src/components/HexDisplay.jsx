import { useState, useEffect, useRef } from 'react';

const HEX_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

export default function HexDisplay({ value, className = '', apagado = false }) {
  const [displayValue, setDisplayValue] = useState(value);
  const timersRef = useRef([]);
  const prevApagadoRef = useRef(apagado);

  const normalizarValor = (valor) =>
    (valor || '0000').toUpperCase().padStart(4, '0').slice(-4);

  const limpiarTimers = () => {
    timersRef.current.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    timersRef.current = [];
  };

  useEffect(() => {
    const valueStr = normalizarValor(value);
    const acabaDeEncender = prevApagadoRef.current && !apagado;

    limpiarTimers();

    if (apagado) {
      setDisplayValue(valueStr);
      prevApagadoRef.current = apagado;
      return;
    }

    if (!acabaDeEncender) {
      setDisplayValue(valueStr);
      prevApagadoRef.current = apagado;
      return;
    }

    setDisplayValue({});

    for (let i = 0; i < 4; i++) {
      const delay = i * 150;
      const timer = setTimeout(() => {
        const targetDigit = valueStr[i];
        let steps = 6 + i * 2;
        let currentStep = 0;

        const spinInterval = setInterval(() => {
          currentStep++;
          if (currentStep <= steps) {
            setDisplayValue((prev) => ({
              ...prev,
              [i]: HEX_DIGITS[Math.floor(Math.random() * 16)],
            }));
          } else {
            setDisplayValue((prev) => ({
              ...prev,
              [i]: targetDigit,
            }));
            clearInterval(spinInterval);
          }
        }, 60);

        timersRef.current.push(spinInterval);
      }, delay);

      timersRef.current.push(timer);
    }

    prevApagadoRef.current = apagado;
  }, [apagado, value]);

  useEffect(() => () => {
    limpiarTimers();
  }, []);

  const displayStr = typeof displayValue === 'object' 
    ? [displayValue[0] || '0', displayValue[1] || '0', displayValue[2] || '0', displayValue[3] || '0'].join('')
    : displayValue || '0000';

  const estadoClase = apagado
    ? 'border-cyan-500/10 bg-black/50 text-transparent'
    : 'border-cyan-500/20 bg-black/60 text-lime-300';

  return (
    <span className={`font-code mx-auto block w-full max-w-[96px] rounded border px-2 py-0.5 text-center text-base tracking-wider sm:text-lg ${estadoClase} ${className}`}>
      {apagado ? (
        <span style={{visibility:'hidden'}}>0000</span>
      ) : (
        displayStr
      )}
    </span>
  );
}
