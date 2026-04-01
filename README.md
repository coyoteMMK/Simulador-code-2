# Simulador CODE-2

Simulador visual de una CPU CODE-2 de 16 bits, construido con React + Vite.

Permite:
- Ejecutar instrucciones paso a paso o en modo automatico.
- Cargar programas desde archivo (`.hex`, `.ehc` o texto plano HEX).
- Editar memoria, registros y puertos de entrada en hexadecimal.
- Ver estado de CPU en tiempo real: `PC`, `IR`, flags (`Z`, `S`, `C`, `V`) y traza de instrucciones.

## Caracteristicas

- Arquitectura de 16 registros (`R0` a `RF`).
- Memoria de `65536` palabras (`0x0000` a `0xFFFF`).
- Stack Pointer inicial en `0xF000` (`RE`).
- Puertos de entrada/salida de `0x00` a `0xFF`.
- Terminal de instrucciones con resaltado de la linea activa.
- Control de velocidad en autoejecucion.

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm 9+

## Instalacion

```bash
npm install
```

En Windows PowerShell, si `npm` da error por politicas de ejecucion, usa:

```bash
npm.cmd install
```

## Ejecucion en desarrollo

```bash
npm run dev
```

Luego abre la URL que muestra Vite (normalmente `http://localhost:5173`).

## Build de produccion

```bash
npm run build
npm run preview
```

## Flujo rapido de uso

1. Enciende el simulador con el boton de power.
2. (Opcional) Activa o desactiva `Inicializar memoria al encender`.
3. Carga un programa con `CARGAR PROGRAMA` o escribe valores manualmente con el panel CPU:
	 - `DIRECCIONES`: navega/carga en memoria.
	 - `REGISTROS`: navega/carga en registros.
4. Ejecuta:
	 - `EJECUTAR`: inicia desde `OP1`/direccion actual.
	 - `CONTINUAR`: avanza en modo paso a paso o sigue navegacion segun modo.
5. Observa resultados en:
	 - Panel de instrucciones.
	 - Estado de CPU (`IR`, `PC`, flags).
	 - Memoria, registros y puertos.

## Formatos de archivo soportados

El cargador detecta automaticamente el formato:

- Intel HEX (lineas que empiezan con `:`)
- CODE-2 HEX (lineas `:` con palabras de 16 bits)
- Texto HEX libre

### 1) Intel HEX

Acepta registros de datos (`00`), fin (`01`) y direccion lineal extendida (`04`).

Ejemplo:

```text
:020000040000FA
:040000001234ABCD3E
:00000001FF
```

### 2) CODE-2 HEX

Registros de datos (`00`) con cantidad de bytes par, mapeados a palabras de 16 bits.

Ejemplo:

```text
:0400100012345678D2
:00000001FF
```

### 3) Texto HEX

Soporta varias sintaxis en el mismo archivo:

- Directiva de cursor: `@0010`
- Direccion con separador: `0010: 1234`
- Direccion y valor por espacios: `0010 1234`
- Lista de palabras consecutivas: `1234 5678 9ABC`

Ejemplo:

```text
# Programa de ejemplo
@0000
2101 2202 6312
000A: F000
```

## Set de instrucciones (resumen)

- `LD Rx, [RD+imm8]`
- `ST [RD+imm8], Rx`
- `LLI Rx, imm8`
- `LHI Rx, imm8`
- `IN Rx, imm8`
- `OUT imm8, Rx`
- `ADDS Rx, Rs, Ra`
- `SUBS Rx, Rs, Ra`
- `NAND Rx, Rs, Ra`
- `SHL Rx`
- `SHR Rx`
- `SHRA Rx`
- `B{R|Z|S|C|V}`
- `CALL{R|Z|S|C|V}`
- `RET`
- `HALT`

## Controles principales de la UI

- `CPU Control`
	- Input hexadecimal de 4 digitos.
	- Botones: `DIRECCIONES`, `REGISTROS`, `CARGAR`, `EJECUTAR`, `CONTINUAR`.
	- Displays `D/OP1` y `C/OP2`.
- `CPU Status`
	- Flags, `IR`, `PC`.
- `Registers`
	- Edicion de `R0` a `RF`.
- `Memory`
	- Navegacion por bloques y edicion de palabras.
- `Controles de Puertos`
	- `IPxx` (entrada) editable.
	- `OPxx` (salida) solo lectura.

## Scripts disponibles

- `npm run dev`: inicia servidor de desarrollo.
- `npm run build`: genera build de produccion.
- `npm run preview`: sirve el build localmente.
- `npm run lint`: ejecuta ESLint.

## Estructura del proyecto

```text
src/
	components/        # Paneles y UI
	simulator/core.js  # Logica de CPU, desensamblado y ejecucion
	App.jsx            # Orquestacion de estado global y flujo de simulacion
```

## Notas

- Al apagar, el estado del simulador se reinicia.
- En autoejecucion, la velocidad se puede ajustar en tiempo real.
- Si un programa ejecuta `HALT`, se muestra un modal de finalizacion.

## Licencia

Define aqui la licencia que desees usar para el repositorio (por ejemplo: MIT).
