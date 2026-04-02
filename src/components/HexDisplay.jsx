import { useState, useEffect, useRef } from 'react';

export default function HexDisplay({ value, className = '', apagado = false }) {
  const [displayValue, setDisplayValue] = useState(value);
  const timersRef = useRef([]);

  const hexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

  useEffect(() => {
    // Limpiar todos los timers anteriores
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];

    // Cuando cambia el valor, limpiar todo primero
    setDisplayValue(() => {
      const newDisplay = {};
      const valueStr = (value || '0000').toUpperCase();
      
      for (let i = 0; i < 4; i++) {
        const delay = i * 150;
        const timer = setTimeout(() => {
          const targetDigit = valueStr[i];
          let steps = 6 + i * 2;
          let currentStep = 0;

          const spinInterval = setInterval(() => {
            currentStep++;
            if (currentStep <= steps) {
              setDisplayValue(prev => ({
                ...prev,
                [i]: hexDigits[Math.floor(Math.random() * 16)]
              }));
            } else {
              setDisplayValue(prev => ({
                ...prev,
                [i]: targetDigit
              }));
              clearInterval(spinInterval);
            }
          }, 60);

          timersRef.current.push(spinInterval);
        }, delay);

        timersRef.current.push(timer);
      }

      return {};
    });

    return () => {
      timersRef.current.forEach(timer => {
        if (typeof timer === 'number') {
          clearTimeout(timer);
          clearInterval(timer);
        }
      });
      timersRef.current = [];
    };
  }, [value]);

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
