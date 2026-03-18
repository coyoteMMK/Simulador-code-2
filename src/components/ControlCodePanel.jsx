import HexDisplay from './HexDisplay';

export default function ControlCodePanel({ ip2Hex, visualOp1, visualOp2, apagado }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="mb-3 text-lg font-semibold">Control CODE-2</h2>
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td className="border border-slate-700 px-3 py-2 font-medium">IP1</td>
            <td className="border border-slate-700 px-3 py-2 text-center">
              <HexDisplay value={visualOp1} apagado={apagado} />
            </td>
          </tr>
          <tr>
            <td className="border border-slate-700 px-3 py-2 font-medium">IP2</td>
            <td className="border border-slate-700 px-3 py-2 text-center">
              <HexDisplay value={ip2Hex} apagado={apagado} />
            </td>
          </tr>
          <tr>
            <td className="border border-slate-700 px-3 py-2 font-medium">OP1</td>
            <td className="border border-slate-700 px-3 py-2 text-center">
              <HexDisplay value={visualOp1} apagado={apagado} />
            </td>
          </tr>
          <tr>
            <td className="border border-slate-700 px-3 py-2 font-medium">OP2</td>
            <td className="border border-slate-700 px-3 py-2 text-center">
              <HexDisplay value={visualOp2} apagado={apagado} />
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}
