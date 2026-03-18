import { useEffect, useMemo, useRef, useState } from 'react';
import TopSection from './components/TopSection';
import RegistersPanel from './components/RegistersPanel';
import MemoryPanel from './components/MemoryPanel';
import ControlCodePanel from './components/ControlCodePanel';
import ToastMessage from './components/ToastMessage';
import {
  MEM_SIZE,
  TAM_BLOQUE,
  toHex,
  desensamblarPalabra,
  resaltarLineaCodigo,
  actualizarLineaCodigo,
  obtenerPanel,
  ejecutarUnPaso,
  randInstruccion,
} from './simulator/core';

function App() {
  const [encendido, setEncendido] = useState(false);
  const [modoPasoAPaso, setModoPasoAPaso] = useState(false);
  const [modoCarga, setModoCarga] = useState('direccion');
  const [registroVisualizado, setRegistroVisualizado] = useState(0);
  const [continuarEnEjecucion, setContinuarEnEjecucion] = useState(false);
  const [autoEjecutando, setAutoEjecutando] = useState(false);
  const [resaltarEjecucion, setResaltarEjecucion] = useState(false);
  const [visorDisplay, setVisorDisplay] = useState({ op1: '0000', op2: '0000' });
  const [execDisplay, setExecDisplay] = useState({ ir: '0000', pc: '0000' });
  const [registros, setRegistros] = useState(() => Array(16).fill(0));
  const [memoria, setMemoria] = useState(() => Array(MEM_SIZE).fill(0));
  const [paginaMemoria, setPaginaMemoria] = useState(0);
  const [pc, setPc] = useState(0);
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [, setPanel] = useState({ pc: '1', ir: '0000', op1: '----', op2: '----' });
  const [direccionInput, setDireccionInput] = useState('0000');
  const autoRunRef = useRef(null);

  const inicio = paginaMemoria * TAM_BLOQUE;
  const fin = inicio + TAM_BLOQUE;
  const bloqueMemoria = useMemo(() => memoria.slice(inicio, fin), [memoria, inicio, fin]);
  const irActualHex = execDisplay.ir;
  const pcActualHex = execDisplay.pc;
  const etiquetaOp1 = modoCarga === 'direccion' ? 'D/OP1' : 'R/OP1';
  const visualOp1 = visorDisplay.op1;
  const visualOp2 = visorDisplay.op2;
  const filasRegistros = useMemo(() => Array.from({ length: 8 }, (_, i) => [i, i + 8]), []);

  const actualizarVisor = (modo, direccionValor, registroValor, memRef, regsRef) => {
    if (modo === 'direccion') {
      setVisorDisplay({
        op1: toHex(direccionValor, 4),
        op2: toHex(memRef[direccionValor] ?? 0, 4),
      });
      return;
    }

    setVisorDisplay({
      op1: toHex(registroValor, 4),
      op2: toHex(regsRef[registroValor] ?? 0, 4),
    });
  };

  const detenerAutoEjecucion = () => {
    if (autoRunRef.current !== null) {
      window.clearInterval(autoRunRef.current);
      autoRunRef.current = null;
    }
    setAutoEjecutando(false);
  };

  useEffect(() => {
    if (!mensaje) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMensaje('');
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [mensaje]);

  useEffect(
    () => () => {
      if (autoRunRef.current !== null) {
        window.clearInterval(autoRunRef.current);
      }
    },
    [],
  );

  const irADireccion = () => {
    const texto = direccionInput.trim();
    const sinPrefijo = texto.toLowerCase().startsWith('0x') ? texto.slice(2) : texto;

    if (!/^[0-9a-fA-F]{1,4}$/.test(sinPrefijo)) {
      setMensaje('Direccion invalida.');
      return;
    }

    const direccion = parseInt(sinPrefijo, 16);

    if (Number.isNaN(direccion) || direccion < 0 || direccion >= MEM_SIZE) {
      setMensaje('Fuera de rango (0000-FFFF).');
      return;
    }

    setPc(direccion);
    setPaginaMemoria(Math.floor(direccion / TAM_BLOQUE));
    setPanel(obtenerPanel(direccion, memoria[direccion] ?? 0, registros, memoria));
    setResaltarEjecucion(false);
    actualizarVisor('direccion', direccion, registroVisualizado, memoria, registros);
    setMensaje(`PC -> 0x${toHex(direccion, 4)}`);
  };

  const irARegistro = () => {
    const texto = direccionInput.trim().toUpperCase();
    const sinPrefijo = texto.toLowerCase().startsWith('0x') ? texto.slice(2) : texto;

    if (!/^[0-9A-F]{4}$/.test(sinPrefijo)) {
      setMensaje('Registro invalido.');
      return;
    }

    const idx = parseInt(sinPrefijo, 16);
    if (Number.isNaN(idx) || idx < 0 || idx > 0x000f) {
      setMensaje('Registro fuera de rango (0000-000F).');
      return;
    }

    setRegistroVisualizado(idx);
    actualizarVisor('registro', pc, idx, memoria, registros);
    setMensaje(`REG -> ${toHex(idx, 4)}`);
  };

  const seleccionarModoCarga = (nuevoModo) => {
    detenerAutoEjecucion();
    setModoCarga(nuevoModo);
    setContinuarEnEjecucion(false);
    setResaltarEjecucion(false);

    if (apagado) {
      return;
    }

    if (nuevoModo === 'direccion') {
      irADireccion();
      return;
    }

    irARegistro();
  };

  const cargarPrograma = () => {
    detenerAutoEjecucion();
    setPc(0);
    setCodigo('');
    setContinuarEnEjecucion(false);
    setResaltarEjecucion(false);
    setMensaje('Programa cargado.');
    setPanel({ pc: '1', ir: '0000', op1: '----', op2: '----' });
    setExecDisplay({ ir: '0000', pc: '0000' });
  };

  const paso = () => {
    const resultado = ejecutarUnPaso(registros, memoria, pc);

    if (resultado.panel) {
      setPanel(resultado.panel);
    }

    setRegistros(resultado.registros);
    setMemoria(resultado.memoria);
    setPc(resultado.pc);
    setExecDisplay({
      ir: toHex(resultado.memoria[resultado.pc] ?? 0, 4),
      pc: toHex(resultado.pc, 4),
    });
    if (resultado.halted) {
      setContinuarEnEjecucion(false);
    }
    setCodigo((prev) => (prev ? resaltarLineaCodigo(prev, resultado.pc) : prev));
    setMensaje(resultado.mensaje);
  };

  const continuarVisualizador = () => {
    if (autoEjecutando) {
      setMensaje('Auto ejecucion activa...');
      return;
    }

    if (continuarEnEjecucion) {
      setResaltarEjecucion(true);
      paso();
      return;
    }

    if (modoCarga === 'direccion') {
      const siguiente = (pc + 1) & 0xffff;
      setPc(siguiente);
      setPaginaMemoria(Math.floor(siguiente / TAM_BLOQUE));
      setPanel(obtenerPanel(siguiente, memoria[siguiente] ?? 0, registros, memoria));
      setResaltarEjecucion(false);
      actualizarVisor('direccion', siguiente, registroVisualizado, memoria, registros);
      setMensaje(`DIR -> 0x${toHex(siguiente, 4)}`);
      return;
    }

    const siguienteRegistro = (registroVisualizado + 1) % 16;
    setRegistroVisualizado(siguienteRegistro);
    setResaltarEjecucion(false);
    actualizarVisor('registro', pc, siguienteRegistro, memoria, registros);
    setMensaje(`REG -> ${toHex(siguienteRegistro, 4)}`);
  };

  const ejecutarPrograma = () => {
    detenerAutoEjecucion();
    const inicioEjecucion = parseInt(visorDisplay.op1, 16);
    const direccionInicio = Number.isNaN(inicioEjecucion) ? pc : inicioEjecucion & 0xffff;

    const resultado = ejecutarUnPaso(registros, memoria, direccionInicio);

    if (resultado.panel) {
      setPanel(resultado.panel);
    }

    setRegistros(resultado.registros);
    setMemoria(resultado.memoria);
    setPc(resultado.pc);
    setPaginaMemoria(Math.floor(resultado.pc / TAM_BLOQUE));
    setExecDisplay({
      ir: toHex(resultado.memoria[resultado.pc] ?? 0, 4),
      pc: toHex(resultado.pc, 4),
    });
    setResaltarEjecucion(true);
    setContinuarEnEjecucion(modoPasoAPaso && !resultado.halted);
    setCodigo((prev) => (prev ? resaltarLineaCodigo(prev, resultado.pc) : prev));
    setMensaje(resultado.mensaje || `Paso 1 desde 0x${toHex(direccionInicio, 4)}.`);

    if (!modoPasoAPaso && !resultado.halted) {
      let regsActual = resultado.registros;
      let memActual = resultado.memoria;
      let pcActual = resultado.pc;

      setAutoEjecutando(true);
      autoRunRef.current = window.setInterval(() => {
        const pasoAuto = ejecutarUnPaso(regsActual, memActual, pcActual);
        regsActual = pasoAuto.registros;
        memActual = pasoAuto.memoria;
        pcActual = pasoAuto.pc;

        if (pasoAuto.panel) {
          setPanel(pasoAuto.panel);
        }

        setRegistros(pasoAuto.registros);
        setMemoria(pasoAuto.memoria);
        setPc(pasoAuto.pc);
        setPaginaMemoria(Math.floor(pasoAuto.pc / TAM_BLOQUE));
        setExecDisplay({
          ir: toHex(pasoAuto.memoria[pasoAuto.pc] ?? 0, 4),
          pc: toHex(pasoAuto.pc, 4),
        });
        setCodigo((prev) => (prev ? resaltarLineaCodigo(prev, pasoAuto.pc) : prev));

        if (pasoAuto.halted) {
          detenerAutoEjecucion();
          setContinuarEnEjecucion(false);
          setMensaje(pasoAuto.mensaje || 'Ejecucion finalizada.');
        }
      }, 500);
    }
  };

  const toggleEncendido = () => {
    detenerAutoEjecucion();

    if (encendido) {
      setEncendido(false);
      setRegistros(Array(16).fill(0));
      setMemoria(Array(MEM_SIZE).fill(0));
      setPaginaMemoria(0);
      setPc(0);
      setModoPasoAPaso(false);
      setModoCarga('direccion');
      setRegistroVisualizado(0);
      setContinuarEnEjecucion(false);
      setResaltarEjecucion(false);
      setVisorDisplay({ op1: '0000', op2: '0000' });
      setExecDisplay({ ir: '0000', pc: '0000' });
      setCodigo('');
      setMensaje('');
      setPanel({ pc: '1', ir: '0000', op1: '----', op2: '----' });
      return;
    }

    const regsIniciales = Array.from({ length: 16 }, (_, i) => i);
    const memAleatorios = Array.from({ length: MEM_SIZE }, randInstruccion);
    const pcInicial = 0;

    setEncendido(true);
    setModoPasoAPaso(true);
    setRegistros(regsIniciales);
    setMemoria(memAleatorios);
    setPaginaMemoria(0);
    setPc(pcInicial);
    setModoCarga('direccion');
    setRegistroVisualizado(0);
    setContinuarEnEjecucion(false);
    setResaltarEjecucion(false);
    setVisorDisplay({ op1: toHex(pcInicial, 4), op2: toHex(memAleatorios[pcInicial] ?? 0, 4) });
    setExecDisplay({ ir: '0000', pc: '0000' });
    setCodigo('');
    setPanel(obtenerPanel(pcInicial, memAleatorios[pcInicial], regsIniciales, memAleatorios));
    setMensaje('ON: simulador iniciado.');
  };

  const editarRegistro = (index) => {
    const actual = toHex(registros[index], 4);
    const nuevo = window.prompt(
      `Nuevo valor HEX para r${index.toString(16).toUpperCase()}:`,
      `0x${actual}`,
    );

    if (nuevo && /^0x[0-9A-Fa-f]{1,4}$/.test(nuevo)) {
      const nuevos = [...registros];
      nuevos[index] = parseInt(nuevo, 16) & 0xffff;
      setRegistros(nuevos);
      if (modoCarga === 'registro') {
        actualizarVisor('registro', pc, registroVisualizado, memoria, nuevos);
      }
    }
  };

  const editarMemoria = (index) => {
    const actual = toHex(memoria[index], 4);
    const nuevo = window.prompt(
      `Nuevo valor HEX para Mem[0x${toHex(index, 4)}]:`,
      `0x${actual}`,
    );

    if (nuevo && /^0x[0-9A-Fa-f]{1,4}$/.test(nuevo)) {
      const valor = parseInt(nuevo, 16) & 0xffff;
      const nuevaMemoria = [...memoria];
      nuevaMemoria[index] = valor;
      setMemoria(nuevaMemoria);
      if (modoCarga === 'direccion') {
        actualizarVisor('direccion', pc, registroVisualizado, nuevaMemoria, registros);
      }
      setCodigo((prev) => actualizarLineaCodigo(prev, index, desensamblarPalabra(valor)));
    }
  };

  const apagado = !encendido;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <TopSection
          codigo={codigo}
          encendido={encendido}
          apagado={apagado}
          modoPasoAPaso={modoPasoAPaso}
          irActualHex={irActualHex}
          pcActualHex={pcActualHex}
          etiquetaOp1={etiquetaOp1}
          visualOp1={visualOp1}
          visualOp2={visualOp2}
          modoCarga={modoCarga}
          direccionInput={direccionInput}
          onToggleEncendido={toggleEncendido}
          onTogglePasoAPaso={() => {
            detenerAutoEjecucion();
            setModoPasoAPaso((prev) => !prev);
            setContinuarEnEjecucion(false);
          }}
          onSelectModoCarga={seleccionarModoCarga}
          onDireccionInputChange={(e) => setDireccionInput(e.target.value.toUpperCase())}
          onCargarPrograma={cargarPrograma}
          onContinuar={continuarVisualizador}
          onEjecutar={ejecutarPrograma}
        />

        <section className={`grid gap-6 xl:grid-cols-[1fr_2fr_1fr] transition-opacity ${apagado ? 'pointer-events-none opacity-30' : ''}`}>
          <RegistersPanel
            registros={registros}
            filasRegistros={filasRegistros}
            onEditRegistro={editarRegistro}
          />

          <MemoryPanel
            inicio={inicio}
            fin={fin}
            bloqueMemoria={bloqueMemoria}
            pc={pc}
            resaltarEjecucion={resaltarEjecucion}
            onEditMemoria={editarMemoria}
            onPrev={() => setPaginaMemoria((p) => Math.max(0, p - 1))}
            onNext={() =>
              setPaginaMemoria((p) => ((p + 1) * TAM_BLOQUE < MEM_SIZE ? p + 1 : p))
            }
          />

          <ControlCodePanel
            irActualHex={irActualHex}
            visualOp1={visualOp1}
            modoCarga={modoCarga}
            visualOp2={visualOp2}
            apagado={apagado}
          />
        </section>

        <ToastMessage mensaje={mensaje} />
      </div>
    </main>
  );
}

export default App;
