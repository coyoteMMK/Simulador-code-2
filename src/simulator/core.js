export const MEM_SIZE = 65536;
export const TAM_BLOQUE = 256;

export function toHex(value, width = 4) {
  return (value & 0xffff).toString(16).toUpperCase().padStart(width, '0');
}

export function desensamblarPalabra(word) {
  const opcode = (word >> 12) & 0xf;
  const r1 = (word >> 8) & 0xf;
  const r2 = (word >> 4) & 0xf;
  const r3 = word & 0xf;
  const val8 = word & 0xff;
  const rx = `R${r1.toString(16).toUpperCase()}`;
  const rs = `R${r2.toString(16).toUpperCase()}`;
  const ra = `R${r3.toString(16).toUpperCase()}`;
  const v = `H'${val8.toString(16).toUpperCase().padStart(2, '0')}`;
  const condiciones = ['AL', 'Z', 'NZ', 'C', 'NC', 'S', 'NS', 'V', 'NV', 'HI', 'LS', 'GE', 'LT', 'GT', 'LE', 'NVL'];

  switch (opcode) {
    case 0x0:
      return `LD ${rx}, [RD+${v}]`;
    case 0x1:
      return `ST [RD+${v}], ${rx}`;
    case 0x2:
      return `LLI ${rx}, ${v}`;
    case 0x3:
      return `LHI ${rx}, ${v}`;
    case 0x6:
      return `ADDS ${rx}, ${rs}, ${ra}`;
    case 0x7:
      return `SUBS ${rx}, ${rs}, ${ra}`;
    case 0xc:
      if (r1 === 0x3) {
        return 'BC';
      }
      if (r1 === 0x0) {
        return 'BR';
      }
      return `B- ${condiciones[r1] ?? toHex(r1, 1)}`;
    case 0xf:
      return 'HALT';
    default:
      return `??? (0x${toHex(word, 4)})`;
  }
}

export function resaltarLineaCodigo(codigo, pc) {
  const pcLinea = `[${toHex(pc, 4)}]:`;
  return codigo
    .split('\n')
    .map((linea) =>
      linea.startsWith(pcLinea) ? `>>> ${linea}` : linea.replace(/^>>>\s*/, ''),
    )
    .join('\n');
}

export function actualizarLineaCodigo(codigo, index, instruccion) {
  const prefijo = `[${toHex(index, 4)}]:`;
  const linea = `${prefijo} ${instruccion}`;
  const lineas = codigo ? codigo.split('\n') : [];
  const existe = lineas.findIndex((l) => l.startsWith(prefijo));

  if (existe >= 0) {
    lineas[existe] = linea;
    return lineas.join('\n');
  }

  return [...lineas, linea].join('\n');
}

export function obtenerPanel(pc, palabra, registros, memoria) {
  const opcode = (palabra >> 12) & 0xf;
  const r1 = (palabra >> 8) & 0xf;
  const r2 = (palabra >> 4) & 0xf;
  const r3 = palabra & 0xf;
  const val8 = palabra & 0xff;

  let op1 = '----';
  let op2 = '----';

  if (opcode === 0x0 || opcode === 0x1) {
    const addr = (registros[0xd] + val8) & 0xffff;
    op1 = toHex(addr, 4);
    op2 = opcode === 0x0 ? toHex(memoria[addr] ?? 0, 4) : toHex(registros[r1], 4);
  } else if (opcode === 0x6 || opcode === 0x7) {
    op1 = toHex(registros[r2], 4);
    op2 = toHex(registros[r3], 4);
  }

  return {
    pc: String(pc + 1),
    ir: toHex(memoria[pc + 1] ?? 0, 4),
    op1,
    op2,
  };
}

export function ejecutarUnPaso(registrosBase, memoriaBase, pcBase, flagsBase = { z: false, s: false, c: false, v: false }) {

  const getZS = (valor) => ({
    z: (valor & 0xffff) === 0,
    s: ((valor >> 15) & 1) === 1,
  });

  const addFlags = (a, b, resultado) => {
    const suma = a + b;
    return {
      ...getZS(resultado),
      c: suma > 0xffff,
      v: ((~(a ^ b) & (a ^ resultado)) & 0x8000) !== 0,
    };
  };

  const subFlags = (a, b, resultado) => ({
    ...getZS(resultado),
    c: a < b,
    v: (((a ^ b) & (a ^ resultado)) & 0x8000) !== 0,
  });

  let flags = flagsBase;

  const cumpleCondicion = (cnd, estado) => {
    switch (cnd & 0xf) {
      case 0x0:
        return true;
      case 0x1:
        return estado.z;
      case 0x2:
        return !estado.z;
      case 0x3:
        return estado.c;
      case 0x4:
        return !estado.c;
      case 0x5:
        return estado.s;
      case 0x6:
        return !estado.s;
      case 0x7:
        return estado.v;
      case 0x8:
        return !estado.v;
      case 0x9:
        return estado.c && !estado.z;
      case 0xa:
        return !estado.c || estado.z;
      case 0xb:
        return estado.s === estado.v;
      case 0xc:
        return estado.s !== estado.v;
      case 0xd:
        return !estado.z && estado.s === estado.v;
      case 0xe:
        return estado.z || estado.s !== estado.v;
      default:
        return false;
    }
  };

  if (pcBase >= memoriaBase.length) {
    return {
      registros: registrosBase,
      memoria: memoriaBase,
      pc: pcBase,
      halted: true,
      mensaje: 'Fin de programa.',
      panel: null,
      flags,
    };
  }

  const palabra = memoriaBase[pcBase];
  const panel = obtenerPanel(pcBase, palabra, registrosBase, memoriaBase);

  const opcode = (palabra >> 12) & 0xf;
  const r1 = (palabra >> 8) & 0xf;
  const r2 = (palabra >> 4) & 0xf;
  const r3 = palabra & 0xf;
  const val8 = palabra & 0xff;

  const nuevosRegistros = [...registrosBase];
  let nuevaMemoria = memoriaBase;
  let siguientePc = (pcBase + 1) & 0xffff;

  switch (opcode) {
    case 0x0: {
      const addr = (nuevosRegistros[0xd] + val8) & 0xffff;
      nuevosRegistros[r1] = memoriaBase[addr] & 0xffff;
      break;
    }
    case 0x1: {
      const addr = (nuevosRegistros[0xd] + val8) & 0xffff;
      nuevaMemoria = [...memoriaBase];
      nuevaMemoria[addr] = nuevosRegistros[r1] & 0xffff;
      break;
    }
    case 0x2:
      nuevosRegistros[r1] = (nuevosRegistros[r1] & 0xff00) | (val8 & 0x00ff);
      break;
    case 0x3:
      nuevosRegistros[r1] = ((val8 & 0x00ff) << 8) | (nuevosRegistros[r1] & 0x00ff);
      break;
    case 0x6:
    {
      const opA = nuevosRegistros[r2] & 0xffff;
      const opB = nuevosRegistros[r3] & 0xffff;
      const resultado = (opA + opB) & 0xffff;
      nuevosRegistros[r1] = resultado;
      flags = addFlags(opA, opB, resultado);
      break;
    }
    case 0x7:
    {
      const opA = nuevosRegistros[r2] & 0xffff;
      const opB = nuevosRegistros[r3] & 0xffff;
      const resultado = (opA - opB) & 0xffff;
      nuevosRegistros[r1] = resultado;
      flags = subFlags(opA, opB, resultado);
      break;
    }
    case 0xc:
      if (cumpleCondicion(r1, flags)) {
        siguientePc = nuevosRegistros[0xd] & 0xffff;
      }
      break;
    case 0xf:
      return {
        registros: nuevosRegistros,
        memoria: nuevaMemoria,
        pc: pcBase,
        halted: true,
        mensaje: 'HALT.',
        panel,
        flags,
      };
    default:
      break;
  }

  return {
    registros: nuevosRegistros,
    memoria: nuevaMemoria,
    pc: siguientePc,
    halted: false,
    mensaje: '',
    panel,
    flags,
  };
}

export function randInstruccion() {
  const opcodes = [0x0, 0x1, 0x6, 0x7];
  const op = opcodes[Math.floor(Math.random() * opcodes.length)];
  const r1 = Math.floor(Math.random() * 16);
  if (op === 0x0 || op === 0x1) {
    const val8 = Math.floor(Math.random() * 256);
    return (op << 12) | (r1 << 8) | val8;
  }
  const r2 = Math.floor(Math.random() * 16);
  const r3 = Math.floor(Math.random() * 16);
  return (op << 12) | (r1 << 8) | (r2 << 4) | r3;
}
