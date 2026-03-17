import { useMemo, useState } from 'react'

const MEM_SIZE = 65536
const TAM_BLOQUE = 256

function toHex(value, width = 4) {
  return (value & 0xffff).toString(16).toUpperCase().padStart(width, '0')
}

function desensamblarPalabra(word) {
  const opcode = (word >> 12) & 0xf
  const r1 = (word >> 8) & 0xf
  const r2 = (word >> 4) & 0xf
  const r3 = word & 0xf
  const val8 = word & 0xff

  switch (opcode) {
    case 0x0:
      return `LD r${r1.toString(16).toUpperCase()}, [rD+#${val8.toString(16).toUpperCase()}]`
    case 0x1:
      return `ST r${r1.toString(16).toUpperCase()}, [rD+#${val8.toString(16).toUpperCase()}]`
    case 0x6:
      return `ADDS r${r1.toString(16).toUpperCase()}, r${r2.toString(16).toUpperCase()}, r${r3.toString(16).toUpperCase()}`
    case 0x7:
      return `SUBS r${r1.toString(16).toUpperCase()}, r${r2.toString(16).toUpperCase()}, r${r3.toString(16).toUpperCase()}`
    case 0xf:
      return 'HALT'
    default:
      return `??? (0x${toHex(word, 4)})`
  }
}

function resaltarLineaCodigo(codigo, pc) {
  const pcLinea = `0x${toHex(pc, 4)}`
  return codigo
    .split('\n')
    .map((linea) =>
      linea.startsWith(pcLinea) ? `>>> ${linea}` : linea.replace(/^>>>\s*/, ''),
    )
    .join('\n')
}

function actualizarLineaCodigo(codigo, index, instruccion) {
  const prefijo = `0x${toHex(index, 4)}:`
  const linea = `${prefijo} ${instruccion}`
  const lineas = codigo ? codigo.split('\n') : []
  const existe = lineas.findIndex((l) => l.startsWith(prefijo))

  if (existe >= 0) {
    lineas[existe] = linea
    return lineas.join('\n')
  }

  return [...lineas, linea].join('\n')
}

function obtenerPanel(pc, palabra, registros, memoria) {
  const opcode = (palabra >> 12) & 0xf
  const r1 = (palabra >> 8) & 0xf
  const r2 = (palabra >> 4) & 0xf
  const r3 = palabra & 0xf
  const val8 = palabra & 0xff

  let op1 = '----'
  let op2 = '----'

  if (opcode === 0x0 || opcode === 0x1) {
    const addr = (registros[0xd] + val8) & 0xffff
    op1 = toHex(addr, 4)
    op2 = opcode === 0x0 ? toHex(memoria[addr] ?? 0, 4) : toHex(registros[r1], 4)
  } else if (opcode === 0x6 || opcode === 0x7) {
    op1 = toHex(registros[r2], 4)
    op2 = toHex(registros[r3], 4)
  }

  return {
    pc: String(pc + 1),
    ir: toHex(memoria[pc + 1] ?? 0, 4),
    op1,
    op2,
  }
}

function ejecutarUnPaso(registrosBase, memoriaBase, pcBase) {
  if (pcBase >= memoriaBase.length) {
    return {
      registros: registrosBase,
      memoria: memoriaBase,
      pc: pcBase,
      halted: true,
      mensaje: 'Programa finalizado.',
      panel: null,
    }
  }

  const palabra = memoriaBase[pcBase]
  const panel = obtenerPanel(pcBase, palabra, registrosBase, memoriaBase)

  const opcode = (palabra >> 12) & 0xf
  const r1 = (palabra >> 8) & 0xf
  const r2 = (palabra >> 4) & 0xf
  const r3 = palabra & 0xf
  const val8 = palabra & 0xff

  const nuevosRegistros = [...registrosBase]
  let nuevaMemoria = memoriaBase

  switch (opcode) {
    case 0x0: {
      const addr = (nuevosRegistros[0xd] + val8) & 0xffff
      nuevosRegistros[r1] = memoriaBase[addr] & 0xffff
      break
    }
    case 0x1: {
      const addr = (nuevosRegistros[0xd] + val8) & 0xffff
      nuevaMemoria = [...memoriaBase]
      nuevaMemoria[addr] = nuevosRegistros[r1] & 0xffff
      break
    }
    case 0x6:
      nuevosRegistros[r1] = (nuevosRegistros[r2] + nuevosRegistros[r3]) & 0xffff
      break
    case 0x7:
      nuevosRegistros[r1] = (nuevosRegistros[r2] - nuevosRegistros[r3]) & 0xffff
      break
    case 0xf:
      return {
        registros: nuevosRegistros,
        memoria: nuevaMemoria,
        pc: pcBase,
        halted: true,
        mensaje: 'HALT ejecutado.',
        panel,
      }
    default:
      break
  }

  return {
    registros: nuevosRegistros,
    memoria: nuevaMemoria,
    pc: pcBase + 1,
    halted: false,
    mensaje: '',
    panel,
  }
}

function randInstruccion() {
  const opcodes = [0x0, 0x1, 0x6, 0x7]
  const op = opcodes[Math.floor(Math.random() * opcodes.length)]
  const r1 = Math.floor(Math.random() * 16)
  if (op === 0x0 || op === 0x1) {
    const val8 = Math.floor(Math.random() * 256)
    return (op << 12) | (r1 << 8) | val8
  }
  const r2 = Math.floor(Math.random() * 16)
  const r3 = Math.floor(Math.random() * 16)
  return (op << 12) | (r1 << 8) | (r2 << 4) | r3
}

function App() {
  const [encendido, setEncendido] = useState(false)
  const [registros, setRegistros] = useState(() => Array(16).fill(0))
  const [memoria, setMemoria] = useState(() => Array(MEM_SIZE).fill(0))
  const [paginaMemoria, setPaginaMemoria] = useState(0)
  const [pc, setPc] = useState(0)
  const [codigo, setCodigo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [panel, setPanel] = useState({ pc: '1', ir: '0000', op1: '----', op2: '----' })
  const [direccionInput, setDireccionInput] = useState('0000')

  const inicio = paginaMemoria * TAM_BLOQUE
  const fin = inicio + TAM_BLOQUE
  const bloqueMemoria = useMemo(() => memoria.slice(inicio, fin), [memoria, inicio, fin])
  const direccionActualHex = toHex(pc, 4)
  const valorActualHex = toHex(memoria[pc] ?? 0, 4)

  const irADireccion = () => {
    const texto = direccionInput.trim()
    const sinPrefijo = texto.toLowerCase().startsWith('0x') ? texto.slice(2) : texto

    if (!/^[0-9a-fA-F]{1,4}$/.test(sinPrefijo)) {
      setMensaje('Direccion invalida. Usa formato HEX, por ejemplo: 0030 o 0x0030.')
      return
    }

    const direccion = parseInt(sinPrefijo, 16)

    if (Number.isNaN(direccion) || direccion < 0 || direccion >= MEM_SIZE) {
      setMensaje('Direccion fuera de rango. Debe estar entre 0x0000 y 0xFFFF.')
      return
    }

    setPc(direccion)
    setPaginaMemoria(Math.floor(direccion / TAM_BLOQUE))
    setPanel(obtenerPanel(direccion, memoria[direccion] ?? 0, registros, memoria))
    setCodigo((prev) => (prev ? resaltarLineaCodigo(prev, direccion) : prev))
    setMensaje(`Direccion actual establecida en 0x${toHex(direccion, 4)}.`)
  }

  const cargarPrograma = () => {
    setPc(0)
    setCodigo('')
    setMensaje('Programa preparado para ejecutar.')
    setPanel({ pc: '1', ir: '0000', op1: '----', op2: '----' })
  }

  const paso = () => {
    const resultado = ejecutarUnPaso(registros, memoria, pc)

    if (resultado.panel) {
      setPanel(resultado.panel)
    }

    setRegistros(resultado.registros)
    setMemoria(resultado.memoria)
    setPc(resultado.pc)
    setCodigo((prev) => (prev ? resaltarLineaCodigo(prev, resultado.pc) : prev))
    setMensaje(resultado.mensaje)
  }

  const ejecutarPrograma = () => {
    let regs = registros
    let mem = memoria
    let puntero = pc
    let panelActual = panel
    let msj = ''
    const maxPasos = 1000

    for (let i = 0; i < maxPasos; i += 1) {
      const resultado = ejecutarUnPaso(regs, mem, puntero)
      regs = resultado.registros
      mem = resultado.memoria
      puntero = resultado.pc
      panelActual = resultado.panel ?? panelActual
      msj = resultado.mensaje

      if (resultado.halted) {
        break
      }
    }

    setRegistros(regs)
    setMemoria(mem)
    setPc(puntero)
    setPanel(panelActual)
    setCodigo((prev) => (prev ? resaltarLineaCodigo(prev, puntero) : prev))
    setMensaje(msj || 'Ejecucion finalizada o limite de 1000 pasos alcanzado.')
  }

  const toggleEncendido = () => {
    if (encendido) {
      // Apagar: limpiar todo
      setEncendido(false)
      setRegistros(Array(16).fill(0))
      setMemoria(Array(MEM_SIZE).fill(0))
      setPaginaMemoria(0)
      setPc(0)
      setCodigo('')
      setMensaje('')
      setPanel({ pc: '1', ir: '0000', op1: '----', op2: '----' })
    } else {
      // Encender: valores aleatorios
      const regsIniciales = Array.from({ length: 16 }, (_, i) => i)
      const memAleatorios = Array.from({ length: MEM_SIZE }, randInstruccion)
      const pcInicial = 0
      setEncendido(true)
      setRegistros(regsIniciales)
      setMemoria(memAleatorios)
      setPaginaMemoria(0)
      setPc(pcInicial)
      setCodigo('')
      setPanel(obtenerPanel(pcInicial, memAleatorios[pcInicial], regsIniciales, memAleatorios))
      setMensaje('Simulador encendido. Memoria y registros inicializados con valores aleatorios.')
    }
  }

  const editarRegistro = (index) => {
    const actual = toHex(registros[index], 4)
    const nuevo = window.prompt(
      `Nuevo valor HEX para r${index.toString(16).toUpperCase()}:`,
      `0x${actual}`,
    )

    if (nuevo && /^0x[0-9A-Fa-f]{1,4}$/.test(nuevo)) {
      const nuevos = [...registros]
      nuevos[index] = parseInt(nuevo, 16) & 0xffff
      setRegistros(nuevos)
    }
  }

  const editarMemoria = (index) => {
    const actual = toHex(memoria[index], 4)
    const nuevo = window.prompt(
      `Nuevo valor HEX para Mem[0x${toHex(index, 4)}]:`,
      `0x${actual}`,
    )

    if (nuevo && /^0x[0-9A-Fa-f]{1,4}$/.test(nuevo)) {
      const valor = parseInt(nuevo, 16) & 0xffff
      const nuevaMemoria = [...memoria]
      nuevaMemoria[index] = valor
      setMemoria(nuevaMemoria)
      setCodigo((prev) =>
        actualizarLineaCodigo(prev, index, desensamblarPalabra(valor)),
      )
    }
  }

  const apagado = !encendido

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 xl:grid-cols-[1fr_360px]">
          <textarea
            value={codigo}
            readOnly
            placeholder="Instrucciones generadas por la memoria se mostraran aqui..."
            className="h-44 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-200 outline-none"
          />

          <div className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-950 p-3">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-14 text-sm text-indigo-300">D/OP1</span>
                <span className="rounded border border-lime-500/40 bg-black px-3 py-1 font-mono text-2xl tracking-widest text-lime-400">
                  {direccionActualHex}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 text-sm text-indigo-300">C/OP2</span>
                <span className="rounded border border-lime-500/40 bg-black px-3 py-1 font-mono text-2xl tracking-widest text-lime-400">
                  {valorActualHex}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          {/* Botón ON/OFF */}
          <button
            type="button"
            onClick={toggleEncendido}
            className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold tracking-widest shadow-lg transition-all ${
              encendido
                ? 'bg-rose-600 text-white shadow-rose-700/50 hover:bg-rose-500'
                : 'bg-slate-700 text-slate-300 shadow-slate-900/50 hover:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                encendido ? 'bg-lime-400 shadow-[0_0_8px_2px_rgba(163,230,53,0.8)]' : 'bg-slate-500'
              }`}
            />
            {encendido ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={cargarPrograma}
            disabled={apagado}
            className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cargar Programa
          </button>
          <button
            type="button"
            onClick={paso}
            disabled={apagado}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente Paso
          </button>
          <button
            type="button"
            onClick={ejecutarPrograma}
            disabled={apagado}
            className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ejecutar
          </button>
          <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-2">
            <label htmlFor="direccion" className="text-xs text-slate-300">
              Direccion
            </label>
            <input
              id="direccion"
              value={direccionInput}
              onChange={(e) => setDireccionInput(e.target.value.toUpperCase())}
              disabled={apagado}
              placeholder="0000"
              className="w-28 rounded border border-slate-600 bg-slate-950 px-2 py-1 font-mono text-sm text-slate-100 outline-none focus:border-cyan-400 disabled:opacity-40"
            />
            <button
              type="button"
              onClick={irADireccion}
              disabled={apagado}
              className="rounded bg-indigo-500 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cargar direccion
            </button>
          </div>
        </section>

        {mensaje && (
          <p className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">
            {mensaje}
          </p>
        )}

        <section className={`grid gap-6 xl:grid-cols-[1fr_2fr_1fr] transition-opacity ${apagado ? 'pointer-events-none opacity-30' : ''}`}>
          <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-lg font-semibold">Registros</h2>
            <div className="max-h-[28rem] overflow-auto rounded-lg border border-slate-700">
              <table className="w-full border-collapse text-center text-sm">
                <thead className="bg-slate-800 text-slate-100">
                  <tr>
                    <th className="border border-slate-700 px-3 py-2">Registro</th>
                    <th className="border border-slate-700 px-3 py-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((valor, i) => (
                    <tr key={i} className="odd:bg-slate-900 even:bg-slate-800/60">
                      <td className="border border-slate-700 px-3 py-2">
                        r{i.toString(16).toUpperCase()}
                      </td>
                      <td
                        className="cursor-pointer border border-slate-700 px-3 py-2 hover:bg-cyan-900/50"
                        onClick={() => editarRegistro(i)}
                      >
                        0x{toHex(valor, 4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Memoria CODE (64K)</h2>
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setPaginaMemoria((p) => Math.max(0, p - 1))}
                  className="rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
                >
                  {'<'}
                </button>
                <span>
                  0x{toHex(inicio, 4)} - 0x{toHex(fin - 1, 4)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaMemoria((p) =>
                      (p + 1) * TAM_BLOQUE < MEM_SIZE ? p + 1 : p,
                    )
                  }
                  className="rounded bg-slate-700 px-2 py-1 hover:bg-slate-600"
                >
                  {'>'}
                </button>
              </div>
            </div>

            <div className="max-h-[28rem] overflow-auto rounded-lg border border-slate-700">
              <table className="w-full border-collapse text-center text-sm">
                <thead className="sticky top-0 bg-slate-800 text-slate-100">
                  <tr>
                    <th className="border border-slate-700 px-3 py-2">Direccion</th>
                    <th className="border border-slate-700 px-3 py-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {bloqueMemoria.map((valor, i) => {
                    const indexAbsoluto = inicio + i
                    const esActual = indexAbsoluto === pc
                    return (
                      <tr
                        key={indexAbsoluto}
                        className={esActual ? 'bg-amber-300 text-slate-900' : 'odd:bg-slate-900 even:bg-slate-800/60'}
                      >
                        <td className="border border-slate-700 px-3 py-2">
                          0x{toHex(indexAbsoluto, 4)}
                        </td>
                        <td
                          className="cursor-pointer border border-slate-700 px-3 py-2 hover:bg-cyan-900/50"
                          onClick={() => editarMemoria(indexAbsoluto)}
                        >
                          0x{toHex(valor, 4)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-lg font-semibold">Control CODE-2</h2>
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="border border-slate-700 px-3 py-2 font-medium">PC (Posicion)</td>
                  <td className="border border-slate-700 px-3 py-2 text-center">{panel.pc}</td>
                </tr>
                <tr>
                  <td className="border border-slate-700 px-3 py-2 font-medium">IR (Valor)</td>
                  <td className="border border-slate-700 px-3 py-2 text-center">{panel.ir}</td>
                </tr>
                <tr>
                  <td className="border border-slate-700 px-3 py-2 font-medium">Direccion / OP1</td>
                  <td className="border border-slate-700 px-3 py-2 text-center">{direccionActualHex}</td>
                </tr>
                <tr>
                  <td className="border border-slate-700 px-3 py-2 font-medium">Contenido / OP2</td>
                  <td className="border border-slate-700 px-3 py-2 text-center">{valorActualHex}</td>
                </tr>
              </tbody>
            </table>
          </article>
        </section>
      </div>
    </main>
  )
}

export default App
