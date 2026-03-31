import { useEffect, useMemo, useRef, useState } from 'react';
import TopAppBar from './components/TopAppBar';
import TopSection from './components/TopSection';
import CPUControlPanel from './components/CPUControlPanel';
import CpuStatusPanel from './components/CpuStatusPanel';
import InstructionsTerminal from './components/InstructionsTerminal';
import RegistersPanel from './components/RegistersPanel';
import MemoryPanel from './components/MemoryPanel';
import ControlCodePanel from './components/ControlCodePanel';
import ToastMessage from './components/ToastMessage';
import HexEditModal from './components/HexEditModal';
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
  const generarHexAleatorio = () => toHex(Math.floor(Math.random() * 0x10000), 4);
  const generarPuertoAleatorio = () => Math.floor(Math.random() * 0x10000);
  const crearPuertosAleatorios = () => ({
    ip: Array.from({ length: 256 }, () => generarPuertoAleatorio()),
    op: Array.from({ length: 256 }, () => generarPuertoAleatorio()),
  });
  const crearPuertosBase = (ip2 = 0) => {
    const ip = Array(256).fill(0);
    const op = Array(256).fill(0);
    ip[0x02] = ip2 & 0xffff;
    return { ip, op };
  };
  const crearRegistrosBase = () => {
    const base = Array(16).fill(0);
    base[0xE] = 0xF000;
    return base;
  };

  const [encendido, setEncendido] = useState(false);
  const [inicializarAlEncender, setInicializarAlEncender] = useState(true);
  const [modoPasoAPaso, setModoPasoAPaso] = useState(false);
  const [modoCarga, setModoCarga] = useState('direccion');
  const [registroVisualizado, setRegistroVisualizado] = useState(0);
  const [continuarEnEjecucion, setContinuarEnEjecucion] = useState(false);
  const [autoEjecutando, setAutoEjecutando] = useState(false);
  const [velocidadAutoMs, setVelocidadAutoMs] = useState(500);
  const [resaltarEjecucion, setResaltarEjecucion] = useState(false);
  const [flags, setFlags] = useState({ z: false, s: false, c: false, v: false });
  const [visorDisplay, setVisorDisplay] = useState({ op1: '0000', op2: '0000' });
  const [execDisplay, setExecDisplay] = useState({ ir: '0000', pc: '0000' });
  const [registros, setRegistros] = useState(() => crearRegistrosBase());
  const [memoria, setMemoria] = useState(() => Array.from({ length: MEM_SIZE }, randInstruccion));
  const [paginaMemoria, setPaginaMemoria] = useState(0);
  const [pc, setPc] = useState(0);
  const [codigo, setCodigo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [modalFin, setModalFin] = useState({ abierto: false, texto: '' });
  const [editorHex, setEditorHex] = useState({
    abierto: false,
    tipo: '',
    index: -1,
    titulo: '',
    etiqueta: '',
    valor: '',
    error: '',
  });
  const [, setPanel] = useState({ pc: '1', ir: '0000', op1: '----', op2: '----' });
  const [direccionInput, setDireccionInput] = useState('0000');
  const [ioPorts, setIoPorts] = useState(() => crearPuertosBase(generarPuertoAleatorio()));
  const [resetMemoriaEdicionesToken, setResetMemoriaEdicionesToken] = useState(0);
  const autoRunRef = useRef(null);
  const fileInputRef = useRef(null);

  const inicio = paginaMemoria * TAM_BLOQUE;
  const fin = inicio + TAM_BLOQUE;
  const bloqueMemoria = useMemo(() => memoria.slice(inicio, fin), [memoria, inicio, fin]);
  const irActualHex = execDisplay.ir;
  const pcActualHex = execDisplay.pc;
  const etiquetaOp1 = modoCarga === 'direccion' ? 'D/OP1' : 'R/OP1';
  const visualOp1 = visorDisplay.op1;
  const visualOp2 = visorDisplay.op2;
  const filasRegistros = useMemo(
    () => [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
    ],
    []
  );

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

  // OP01 y OP02 siguen al display superior: D/OP1 y C/OP2.
  useEffect(() => {
    if (!encendido) {
      return;
    }

    const op1Valor = parseInt(visualOp1, 16);
    const op2Valor = parseInt(visualOp2, 16);

    if (Number.isNaN(op1Valor) || Number.isNaN(op2Valor)) {
      return;
    }

    setIoPorts((prev) => {
      const opActual = prev.op ?? Array(256).fill(0);
      const nuevoOp = [...opActual];
      const v1 = op1Valor & 0xffff;
      const v2 = op2Valor & 0xffff;
      const cambio = nuevoOp[0x01] !== v1 || nuevoOp[0x02] !== v2;

      if (!cambio) {
        return prev;
      }

      nuevoOp[0x01] = v1;
      nuevoOp[0x02] = v2;
      return { ...prev, op: nuevoOp };
    });
  }, [encendido, visualOp1, visualOp2]);

  const notificarFinPrograma = (texto) => {
    setModalFin({
      abierto: true,
      texto: texto || 'Programa finalizado.',
    });
  };

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

  const parseHexToken = (token) => {
    const limpio = token.trim().replace(/^0x/i, '');
    if (!/^[0-9a-fA-F]{1,4}$/.test(limpio)) {
      return null;
    }
    return parseInt(limpio, 16) & 0xffff;
  };

  const parseIntelHex = (contenido) => {
    const lineas = contenido.split(/\r?\n/);
    const bytes = new Map();
    let baseAlta = 0;

    lineas.forEach((lineaOriginal, idx) => {
      const linea = lineaOriginal.replace(/\/\/.*$|;.*$|#.*$/g, '').trim();
      if (!linea) {
        return;
      }
      if (!linea.startsWith(':')) {
        throw new Error(`Linea ${idx + 1}: formato Intel HEX invalido.`);
      }

      const payload = linea.slice(1);
      if (!/^[0-9A-Fa-f]+$/.test(payload) || payload.length < 10 || payload.length % 2 !== 0) {
        throw new Error(`Linea ${idx + 1}: contenido HEX invalido.`);
      }

      const count = parseInt(payload.slice(0, 2), 16);
      const addr = parseInt(payload.slice(2, 6), 16);
      const tipo = parseInt(payload.slice(6, 8), 16);
      const dataHex = payload.slice(8, 8 + count * 2);

      if (dataHex.length !== count * 2) {
        throw new Error(`Linea ${idx + 1}: longitud de datos inconsistente.`);
      }

      if (tipo === 0x00) {
        for (let i = 0; i < count; i += 1) {
          const byteVal = parseInt(dataHex.slice(i * 2, i * 2 + 2), 16);
          const byteAddr = baseAlta + addr + i;
          bytes.set(byteAddr, byteVal);
        }
      } else if (tipo === 0x04) {
        baseAlta = parseInt(dataHex, 16) << 16;
      } else if (tipo === 0x01) {
        return;
      }
    });

    const palabras = new Map();
    [...bytes.entries()].forEach(([byteAddr, byteVal]) => {
      const wordAddr = (byteAddr >> 1) & 0xffff;
      const previo = palabras.get(wordAddr) ?? 0;
      if ((byteAddr & 1) === 0) {
        palabras.set(wordAddr, ((byteVal & 0xff) << 8) | (previo & 0x00ff));
      } else {
        palabras.set(wordAddr, (previo & 0xff00) | (byteVal & 0xff));
      }
    });

    if (palabras.size === 0) {
      throw new Error('El archivo no contiene datos para cargar.');
    }

    const updates = [...palabras.entries()]
      .map(([address, value]) => ({ address, value: value & 0xffff }))
      .sort((a, b) => a.address - b.address);

    return {
      updates,
      startAddress: updates[0].address,
    };
  };

  const parseCode2Hex = (contenido) => {
    const lineas = contenido.split(/\r?\n/);
    const updatesMap = new Map();

    lineas.forEach((lineaOriginal, idx) => {
      const linea = lineaOriginal.replace(/\/\/.*$|;.*$|#.*$/g, '').trim();
      if (!linea) {
        return;
      }

      if (!linea.startsWith(':')) {
        throw new Error(`Linea ${idx + 1}: formato CODE-2 HEX invalido.`);
      }

      const payload = linea.slice(1);
      if (!/^[0-9A-Fa-f]+$/.test(payload) || payload.length < 10 || payload.length % 2 !== 0) {
        throw new Error(`Linea ${idx + 1}: contenido HEX invalido.`);
      }

      const count = parseInt(payload.slice(0, 2), 16);
      const addr = parseInt(payload.slice(2, 6), 16) & 0xffff;
      const tipo = parseInt(payload.slice(6, 8), 16);
      const dataHex = payload.slice(8, 8 + count * 2);

      if (dataHex.length !== count * 2) {
        throw new Error(`Linea ${idx + 1}: longitud de datos inconsistente.`);
      }

      if (tipo === 0x01) {
        return;
      }

      if (tipo !== 0x00) {
        throw new Error(`Linea ${idx + 1}: tipo de registro no soportado para CODE-2 HEX.`);
      }

      if (count % 2 !== 0) {
        throw new Error(`Linea ${idx + 1}: la cantidad de bytes debe ser par.`);
      }

      for (let i = 0; i < count; i += 2) {
        const hi = parseInt(dataHex.slice(i * 2, i * 2 + 2), 16);
        const lo = parseInt(dataHex.slice(i * 2 + 2, i * 2 + 4), 16);
        const wordAddr = (addr + i / 2) & 0xffff;
        updatesMap.set(wordAddr, ((hi << 8) | lo) & 0xffff);
      }
    });

    if (updatesMap.size === 0) {
      throw new Error('El archivo no contiene palabras CODE-2 validas.');
    }

    const updates = [...updatesMap.entries()]
      .map(([address, value]) => ({ address, value }))
      .sort((a, b) => a.address - b.address);

    return {
      updates,
      startAddress: updates[0].address,
    };
  };

  const parseTextoHex = (contenido) => {
    const updatesMap = new Map();
    let cursor = 0;

    const lineas = contenido.split(/\r?\n/);
    lineas.forEach((lineaOriginal, idx) => {
      const sinComentario = lineaOriginal.replace(/\/\/.*$|;.*$|#.*$/g, '').trim();
      if (!sinComentario) {
        return;
      }

      const directiva = sinComentario.match(/^@([0-9a-fA-F]{1,4})$/);
      if (directiva) {
        cursor = parseInt(directiva[1], 16) & 0xffff;
        return;
      }

      const conDireccion = sinComentario.match(/^([0-9a-fA-FxX]{1,6})\s*:\s*([0-9a-fA-FxX]{1,6})$/);
      if (conDireccion) {
        const address = parseHexToken(conDireccion[1]);
        const value = parseHexToken(conDireccion[2]);
        if (address === null || value === null) {
          throw new Error(`Linea ${idx + 1}: direccion/valor invalido.`);
        }
        updatesMap.set(address, value);
        cursor = (address + 1) & 0xffff;
        return;
      }

      const tokens = sinComentario.split(/[\s,]+/).filter(Boolean);
      if (tokens.length === 2) {
        const address = parseHexToken(tokens[0]);
        const value = parseHexToken(tokens[1]);
        if (address !== null && value !== null) {
          updatesMap.set(address, value);
          cursor = (address + 1) & 0xffff;
          return;
        }
      }

      tokens.forEach((token) => {
        const value = parseHexToken(token);
        if (value === null) {
          throw new Error(`Linea ${idx + 1}: token HEX invalido (${token}).`);
        }
        updatesMap.set(cursor, value);
        cursor = (cursor + 1) & 0xffff;
      });
    });

    if (updatesMap.size === 0) {
      throw new Error('El archivo no contiene palabras HEX validas.');
    }

    const updates = [...updatesMap.entries()]
      .map(([address, value]) => ({ address, value: value & 0xffff }))
      .sort((a, b) => a.address - b.address);

    return {
      updates,
      startAddress: updates[0].address,
    };
  };

  const cargarProgramaDesdeArchivo = async (event) => {
    const archivo = event.target.files?.[0];
    event.target.value = '';

    if (!archivo) {
      return;
    }

    try {
      detenerAutoEjecucion();

      const contenido = await archivo.text();
      let resultado;

      if (/^\s*:/m.test(contenido)) {
        try {
          resultado = parseCode2Hex(contenido);
        } catch {
          resultado = parseIntelHex(contenido);
        }
      } else {
        resultado = parseTextoHex(contenido);
      }

      const { updates, startAddress } = resultado;

      const nuevaMemoria = [...memoria];
      updates.forEach(({ address, value }) => {
        nuevaMemoria[address] = value;
      });

      const lineasCodigo = updates
        .map(({ address, value }) => `[${toHex(address, 4)}]: ${desensamblarPalabra(value)}`)
        .join('\n');

      setMemoria(nuevaMemoria);
      setPc(startAddress);
      setPaginaMemoria(Math.floor(startAddress / TAM_BLOQUE));
      setContinuarEnEjecucion(false);
      setResaltarEjecucion(false);
      setCodigo(lineasCodigo);
      setPanel(obtenerPanel(startAddress, nuevaMemoria[startAddress] ?? 0, registros, nuevaMemoria));
      setExecDisplay({
        ir: toHex(nuevaMemoria[startAddress] ?? 0, 4),
        pc: toHex(startAddress, 4),
      });
      setDireccionInput(toHex(startAddress, 4));

      if (modoCarga === 'direccion') {
        actualizarVisor('direccion', startAddress, registroVisualizado, nuevaMemoria, registros);
      } else {
        actualizarVisor('registro', startAddress, registroVisualizado, nuevaMemoria, registros);
      }

      setMensaje(`Programa cargado: ${updates.length} palabras desde H${toHex(startAddress, 4)}.`);
    } catch (error) {
      setMensaje(`Error al cargar archivo: ${error.message}`);
    }
  };

  const cargarPrograma = () => {
    fileInputRef.current?.click();
  };

  const inicializarMemoriaAleatoria = () => {
    if (apagado) {
      return;
    }

    detenerAutoEjecucion();

    const nuevaMemoria = Array.from(
      { length: MEM_SIZE },
      () => Math.floor(Math.random() * 0x10000) & 0xffff,
    );

    setMemoria(nuevaMemoria);
    setPanel(obtenerPanel(pc, nuevaMemoria[pc] ?? 0, registros, nuevaMemoria));
    setExecDisplay({
      ir: toHex(nuevaMemoria[pc] ?? 0, 4),
      pc: toHex(pc, 4),
    });
    setContinuarEnEjecucion(false);
    setResaltarEjecucion(false);
    setCodigo('');
    setResetMemoriaEdicionesToken((prev) => prev + 1);

    if (modoCarga === 'direccion') {
      actualizarVisor('direccion', pc, registroVisualizado, nuevaMemoria, registros);
    } else {
      actualizarVisor('registro', pc, registroVisualizado, nuevaMemoria, registros);
    }

    setMensaje('Memoria inicializada con valores aleatorios.');
  };

  const paso = () => {
    const resultado = ejecutarUnPaso(registros, memoria, pc, flags, ioPorts);

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
    setFlags(resultado.flags);
    setIoPorts(resultado.io);
    if (resultado.halted) {
      setContinuarEnEjecucion(false);
      notificarFinPrograma('Ejecucion finalizada (HALT).');
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
      setPaginaMemoria(Math.floor(pc / TAM_BLOQUE));
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

  const cargarValorManual = () => {
    if (apagado) {
      return;
    }

    const texto = direccionInput.trim();
    const sinPrefijo = texto.toLowerCase().startsWith('0x') ? texto.slice(2) : texto;

    if (!/^[0-9a-fA-F]{1,4}$/.test(sinPrefijo)) {
      setMensaje('Valor invalido. Use HEX de 1 a 4 digitos.');
      return;
    }

    const valor = parseInt(sinPrefijo, 16) & 0xffff;

    if (modoCarga === 'direccion') {
      const dirActual = parseInt(visualOp1, 16);
      if (Number.isNaN(dirActual) || dirActual < 0 || dirActual >= MEM_SIZE) {
        setMensaje('Direccion OP1 invalida para cargar.');
        return;
      }

      const nuevaMemoria = [...memoria];
      nuevaMemoria[dirActual] = valor;
      const siguiente = (dirActual + 1) & 0xffff;

      setMemoria(nuevaMemoria);
      setPc(siguiente);
      setPaginaMemoria(Math.floor(siguiente / TAM_BLOQUE));
      setPanel(obtenerPanel(siguiente, nuevaMemoria[siguiente] ?? 0, registros, nuevaMemoria));
      setResaltarEjecucion(false);
      actualizarVisor('direccion', siguiente, registroVisualizado, nuevaMemoria, registros);
      setCodigo((prev) => actualizarLineaCodigo(prev, dirActual, desensamblarPalabra(valor)));
      setMensaje(`Mem[H${toHex(dirActual, 4)}] <- H${toHex(valor, 4)}. Siguiente: H${toHex(siguiente, 4)}.`);
      return;
    }

    const regActual = registroVisualizado & 0xf;
    const nuevosRegistros = [...registros];
    nuevosRegistros[regActual] = valor;
    const siguienteReg = (regActual + 1) % 16;

    setRegistros(nuevosRegistros);
    setRegistroVisualizado(siguienteReg);
    setResaltarEjecucion(false);
    actualizarVisor('registro', pc, siguienteReg, memoria, nuevosRegistros);
    setMensaje(`R${toHex(regActual, 1)} <- H${toHex(valor, 4)}. Siguiente: R${toHex(siguienteReg, 1)}.`);
  };

  const ejecutarPrograma = () => {
    detenerAutoEjecucion();
    const inicioEjecucion = parseInt(visorDisplay.op1, 16);
    const direccionInicio = Number.isNaN(inicioEjecucion) ? pc : inicioEjecucion & 0xffff;

    setPaginaMemoria(Math.floor(pc / TAM_BLOQUE));
    const resultado = ejecutarUnPaso(registros, memoria, direccionInicio, flags, ioPorts);

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
    setFlags(resultado.flags);
    setIoPorts(resultado.io);
    setResaltarEjecucion(true);
    setContinuarEnEjecucion(modoPasoAPaso && !resultado.halted);
    setCodigo((prev) => (prev ? resaltarLineaCodigo(prev, resultado.pc) : prev));
    setMensaje(resultado.mensaje || `Paso 1 desde 0x${toHex(direccionInicio, 4)}.`);

    if (resultado.halted) {
      notificarFinPrograma('Ejecucion finalizada (HALT).');
    }

    if (!modoPasoAPaso && !resultado.halted) {
      let regsActual = resultado.registros;
      let memActual = resultado.memoria;
      let pcActual = resultado.pc;
      let flagsActual = resultado.flags;
      let ioActual = resultado.io;

      setAutoEjecutando(true);

      // Guardar la función en una ref para que sea accesible desde useEffect
      autoRunRef.ejecutarPasoAuto = () => {
        const pasoAuto = ejecutarUnPaso(regsActual, memActual, pcActual, flagsActual, ioActual);
        regsActual = pasoAuto.registros;
        memActual = pasoAuto.memoria;
        pcActual = pasoAuto.pc;
        flagsActual = pasoAuto.flags;
        ioActual = pasoAuto.io;

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
        setFlags(pasoAuto.flags);
        setIoPorts(pasoAuto.io);
        setCodigo((prev) => (prev ? resaltarLineaCodigo(prev, pasoAuto.pc) : prev));

        if (pasoAuto.halted) {
          detenerAutoEjecucion();
          setContinuarEnEjecucion(false);
          setMensaje(pasoAuto.mensaje || 'Ejecucion finalizada.');
          notificarFinPrograma('Ejecucion finalizada (HALT).');
        }
      };

      autoRunRef.current = window.setInterval(autoRunRef.ejecutarPasoAuto, velocidadAutoMs);
    }
    // --- Permitir ajustar la velocidad auto en tiempo real durante la ejecución ---
    useEffect(() => {
      if (!autoEjecutando || modoPasoAPaso) return;
      if (autoRunRef.current !== null) {
        window.clearInterval(autoRunRef.current);
      }
      if (typeof autoRunRef.ejecutarPasoAuto === 'function') {
        autoRunRef.current = window.setInterval(autoRunRef.ejecutarPasoAuto, velocidadAutoMs);
      }
      return () => {
        if (autoRunRef.current !== null) {
          window.clearInterval(autoRunRef.current);
          autoRunRef.current = null;
        }
      };
    }, [velocidadAutoMs, modoPasoAPaso, autoEjecutando]);
  };

  const toggleEncendido = () => {
    detenerAutoEjecucion();

    if (encendido) {
      setEncendido(false);
      setEditorHex((prev) => ({ ...prev, abierto: false, error: '' }));
      setRegistros(crearRegistrosBase());
      setPaginaMemoria(0);
      setPc(0);
      setModoPasoAPaso(false);
      setModoCarga('direccion');
      setRegistroVisualizado(0);
      setContinuarEnEjecucion(false);
      setResaltarEjecucion(false);
      setFlags({ z: false, s: false, c: false, v: false });
      setIoPorts(crearPuertosBase(0));
      setVisorDisplay({ op1: '0000', op2: '0000' });
      setExecDisplay({ ir: '0000', pc: '0000' });
      setCodigo('');
      setMensaje('');
      setModalFin({ abierto: false, texto: '' });
      setPanel({ pc: '1', ir: '0000', op1: '----', op2: '----' });
      return;
    }

    const regsIniciales = Array.from({ length: 16 }, (_, i) => i);
    regsIniciales[0xE] = 0xF000;
    const memAleatorios = Array.from({ length: MEM_SIZE }, randInstruccion);
    const memoriaBase = inicializarAlEncender ? memAleatorios : [...memoria];
    const pcInicial = 0;

    setEncendido(true);
    setModoPasoAPaso(true);
    setIoPorts(crearPuertosAleatorios());
    setRegistros(regsIniciales);
    setMemoria(memoriaBase);
    setPaginaMemoria(0);
    setPc(pcInicial);
    setModoCarga('direccion');
    setRegistroVisualizado(0);
    setContinuarEnEjecucion(false);
    setResaltarEjecucion(false);
    setFlags({ z: false, s: false, c: false, v: false });
    setVisorDisplay({ op1: toHex(pcInicial, 4), op2: toHex(memoriaBase[pcInicial] ?? 0, 4) });
    setExecDisplay({ ir: '0000', pc: '0000' });
    setCodigo('');
    setModalFin({ abierto: false, texto: '' });
    setPanel(obtenerPanel(pcInicial, memoriaBase[pcInicial], regsIniciales, memoriaBase));
    setMensaje('ON: simulador iniciado.');
  };

  const cerrarEditorHex = () => {
    setEditorHex((prev) => ({ ...prev, abierto: false, error: '' }));
  };

  const abrirEditorRegistro = (index) => {
    setEditorHex({
      abierto: true,
      tipo: 'registro',
      index,
      titulo: `Editar registro r${index.toString(16).toUpperCase()}`,
      etiqueta: 'Valor HEX',
      valor: toHex(registros[index], 4),
      error: '',
    });
  };

  const abrirEditorPuertoEntrada = (index) => {
    const valorActual = ioPorts.ip?.[index] ?? 0;
    setEditorHex({
      abierto: true,
      tipo: 'puerto-ip',
      index,
      titulo: `Editar puerto IP${toHex(index, 2)}`,
      etiqueta: 'Valor HEX',
      valor: toHex(valorActual, 4),
      error: '',
    });
  };

  const confirmarEditorHex = () => {
    const texto = editorHex.valor.trim();
    const limpio = texto.toLowerCase().startsWith('0x') ? texto.slice(2) : texto;

    if (!/^[0-9a-fA-F]{1,4}$/.test(limpio)) {
      setEditorHex((prev) => ({
        ...prev,
        error: 'Formato invalido. Use HEX de 1 a 4 digitos.',
      }));
      return;
    }

    const valor = parseInt(limpio, 16) & 0xffff;

    if (editorHex.tipo === 'registro') {
      const nuevos = [...registros];
      nuevos[editorHex.index] = valor;
      setRegistros(nuevos);
      if (modoCarga === 'registro') {
        actualizarVisor('registro', pc, registroVisualizado, memoria, nuevos);
      }
      setMensaje(`r${editorHex.index.toString(16).toUpperCase()} actualizado a 0x${toHex(valor, 4)}.`);
      cerrarEditorHex();
      return;
    }

    if (editorHex.tipo === 'puerto-ip') {
      setIoPorts((prev) => {
        const ip = [...(prev.ip ?? Array(256).fill(0))];
        ip[editorHex.index] = valor;
        return { ...prev, ip };
      });
      setMensaje(`IP${toHex(editorHex.index, 2)} actualizado a 0x${toHex(valor, 4)}.`);
      cerrarEditorHex();
      return;
    }
  };

  const editarRegistro = (index) => {
    abrirEditorRegistro(index);
  };

  const editarMemoria = (index, valor) => {
    const nuevaMemoria = [...memoria];
    nuevaMemoria[index] = valor;
    setMemoria(nuevaMemoria);
    if (modoCarga === 'direccion') {
      actualizarVisor('direccion', pc, registroVisualizado, nuevaMemoria, registros);
    }
    setCodigo((prev) => actualizarLineaCodigo(prev, index, desensamblarPalabra(valor)));
    setMensaje(`Mem[H${toHex(index, 4)}] actualizada a 0x${toHex(valor, 4)}.`);
  };

  const editarPuertoEntradaValor = (index, valor) => {
    setIoPorts((prev) => {
      const ip = [...(prev.ip ?? Array(256).fill(0))];
      ip[index] = valor & 0xffff;
      return { ...prev, ip };
    });
    setMensaje(`IP${toHex(index, 2)} actualizada a 0x${toHex(valor, 4)}.`);
  };

  const toggleFlag = (key) => {
    if (!encendido) {
      return;
    }

    setFlags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const apagado = !encendido;

  return (

    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#030915] text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(27,168,255,0.16),transparent_35%),radial-gradient(circle_at_90%_100%,rgba(13,83,255,0.15),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,36,0.35),rgba(3,8,16,0.85))]" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".hex,.ehc,text/plain"
        onChange={cargarProgramaDesdeArchivo}
        className="hidden"
      />

      <TopAppBar
        encendido={encendido}
        onToggleEncendido={toggleEncendido}
        onCargarPrograma={cargarPrograma}
        onInicializarMemoria={inicializarMemoriaAleatoria}
        inicializarAlEncender={inicializarAlEncender}
        setInicializarAlEncender={setInicializarAlEncender}
        modoPasoAPaso={modoPasoAPaso}
        onTogglePasoAPaso={() => {
          detenerAutoEjecucion();
          setModoPasoAPaso((prev) => !prev);
          setContinuarEnEjecucion(false);
        }}
        velocidadAutoMs={velocidadAutoMs}
        onVelocidadAutoChange={setVelocidadAutoMs}
        apagado={apagado}
      />

      <div className="main-mobile-stack relative mt-16 grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-[29fr_24fr_28fr_19fr] gap-4 overflow-hidden p-3 lg:gap-5 lg:p-5 w-full min-w-0 max-w-none">
        {/* Intercambiadas las columnas de instrucciones y CPU control */}
        <div
          className="min-w-0 w-full flex flex-col gap-4 overflow-x-hidden pb-1 lg:gap-5 flex-1 min-h-0 scroll-internal"
        >
          
          <CPUControlPanel
            irActualHex={irActualHex}
            pcActualHex={pcActualHex}
            flags={flags}
            onToggleFlag={toggleFlag}
            modoPasoAPaso={modoPasoAPaso}
            onTogglePasoAPaso={() => {
              detenerAutoEjecucion();
              setModoPasoAPaso((prev) => !prev);
              setContinuarEnEjecucion(false);
            }}
            velocidadAutoMs={velocidadAutoMs}
            onVelocidadAutoChange={setVelocidadAutoMs}
            apagado={apagado}
            onDireccionesClick={() => seleccionarModoCarga('direccion')}
            onRegistrosClick={() => seleccionarModoCarga('registro')}
            onCargarClick={cargarValorManual}
            onEjecutarClick={ejecutarPrograma}
            onContinuarClick={continuarVisualizador}
            direccionInput={direccionInput}
            onDireccionInputChange={setDireccionInput}
            visualOp1={visualOp1}
            visualOp2={visualOp2}
          />
        </div>

        <div
          className="min-w-0 w-full flex flex-col gap-4 overflow-x-hidden pb-1 lg:gap-5"
          style={{ height: '100%', maxHeight: '100%', overflowY: 'auto' }}
        >
          <div className="flex-1 min-h-0 flex flex-col">
            <CpuStatusPanel
              irActualHex={irActualHex}
              pcActualHex={pcActualHex}
              flags={flags}
              onToggleFlag={toggleFlag}
              apagado={apagado}
            />
            <InstructionsTerminal 
              codigo={codigo} 
              className="flex-1 min-h-0" 
              resaltarEjecucion={resaltarEjecucion}
              pcActual={parseInt(pcActualHex, 16)}
            />
          </div>
        </div>

        <div className="min-w-0 w-full flex min-h-0 flex-col gap-4 overflow-auto pb-1 lg:gap-5">
          <RegistersPanel
            registros={registros}
            filasRegistros={filasRegistros}
            onEditRegistro={editarRegistro}
            apagado={apagado}
            className={apagado ? 'pointer-events-none opacity-30' : ''}
          />

          <ControlCodePanel
            ipPorts={ioPorts.ip ?? []}
            opPorts={ioPorts.op ?? []}
            apagado={apagado}
            onEditIp={abrirEditorPuertoEntrada}
            onEditIpValue={editarPuertoEntradaValor}
            onFormatoInvalido={() => setMensaje('Formato invalido. Use HEX de 1 a 4 digitos.')}
            className={apagado ? 'pointer-events-none opacity-30' : ''}
          />

          
        </div>

        <div className="min-w-0 w-full overflow-auto pb-1 scroll-internal" style={{ minWidth: '0' }}>
          <MemoryPanel
            inicio={inicio}
            fin={fin}
            bloqueMemoria={bloqueMemoria}
            pc={pc}
            resaltarEjecucion={resaltarEjecucion}
            apagado={apagado}
            resetEdicionesToken={resetMemoriaEdicionesToken}
            onEditMemoria={editarMemoria}
            onFormatoInvalido={() => setMensaje('Formato invalido. Use HEX de 1 a 4 digitos.')}
            onPrev={(nuevoInicio) => {
              if (typeof nuevoInicio === 'number') {
                setPaginaMemoria(Math.floor(nuevoInicio / TAM_BLOQUE));
              } else {
                setPaginaMemoria((p) => Math.max(0, p - 1));
              }
            }}
            onNext={(nuevoInicio) => {
              if (typeof nuevoInicio === 'number') {
                setPaginaMemoria(Math.floor(nuevoInicio / TAM_BLOQUE));
              } else {
                setPaginaMemoria((p) => ((p + 1) * TAM_BLOQUE < MEM_SIZE ? p + 1 : p));
              }
            }}
          />
        </div>
      </div>

      <ToastMessage mensaje={mensaje} />

      {modalFin.abierto ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-xl border border-cyan-400/40 bg-slate-900 p-5 shadow-[0_20px_60px_-20px_rgba(34,211,238,0.5)]">
            <h3 className="text-lg font-semibold text-cyan-200">Programa finalizado</h3>
            <p className="mt-2 text-sm text-slate-200">{modalFin.texto}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setModalFin({ abierto: false, texto: '' })}
                className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <HexEditModal
        abierto={editorHex.abierto}
        titulo={editorHex.titulo}
        etiqueta={editorHex.etiqueta}
        valor={editorHex.valor}
        error={editorHex.error}
        onChange={(nuevoValor) =>
          setEditorHex((prev) => ({ ...prev, valor: nuevoValor, error: '' }))
        }
        onConfirm={confirmarEditorHex}
        onCancel={cerrarEditorHex}
      />
    </main>
  );
}

export default App;