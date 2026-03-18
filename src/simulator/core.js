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

  switch (opcode) {
    case 0x0:
      return `LD ${rx}, [RD+${v}]`;
    case 0x1:
      return `ST [RD+${v}], ${rx}`;
    case 0x6:
      return `ADDS ${rx}, ${rs}, ${ra}`;
    case 0x7:
      return `SUBS ${rx}, ${rs}, ${ra}`;
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

export function ejecutarUnPaso(registrosBase, memoriaBase, pcBase) {
  if (pcBase >= memoriaBase.length) {
    return {
      registros: registrosBase,
      memoria: memoriaBase,
      pc: pcBase,
      halted: true,
      mensaje: 'Fin de programa.',
      panel: null,
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
    case 0x6:
      nuevosRegistros[r1] = (nuevosRegistros[r2] + nuevosRegistros[r3]) & 0xffff;
      break;
    case 0x7:
      nuevosRegistros[r1] = (nuevosRegistros[r2] - nuevosRegistros[r3]) & 0xffff;
      break;
    case 0xf:
      return {
        registros: nuevosRegistros,
        memoria: nuevaMemoria,
        pc: pcBase,
        halted: true,
        mensaje: 'HALT.',
        panel,
      };
    default:
      break;
  }

  return {
    registros: nuevosRegistros,
    memoria: nuevaMemoria,
    pc: pcBase + 1,
    halted: false,
    mensaje: '',
    panel,
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
