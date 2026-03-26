export default function AbstractVisualizer() {
  return (
    <article className="relative min-h-[180px] flex-1 overflow-hidden rounded-xl border border-cyan-500/15 bg-[#0d182a]/80 p-4">
      <img
        alt="Microchip circuitry"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9yYMEWRfzqcaETun3TEh6BHbbM0-KKTHTUH3tdKqRNxYhzPeYHD9AzQ-w5KJBD2KRlzSQLZsqdJVOgViAhpTYllTYv18KojbTr4X8tPeBOfDT9LkZsOL1SSE7QEAsxNZ9hzf2tVoStuL0FSrM730rIxyBCMu1QtLKOZk8grnsmrYk_c6H8ohw5BZaouCdy2ZBid0P3WQE2Ox244c8qiBXSp_N2g4FMuxbRARy-Ta39sDYw7dzjcHnM6JtyCToWnTAjylzuFwPDQ"
        className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-50 pointer-events-none select-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none select-none" />
      <div className="relative p-6 flex flex-col justify-end h-full">
        <p className="font-code mb-2 text-[10px] uppercase tracking-[0.3em] text-white text-center">
          Architect_Process_Viz
        </p>
        <div className="flex items-end gap-1 h-12">
          <div className="w-1 bg-cyan-400/40 h-1/2" />
          <div className="w-1 bg-cyan-400/60 h-2/3" />
          <div className="w-1 bg-cyan-400 h-full" />
          <div className="w-1 bg-cyan-400/50 h-3/4" />
          <div className="w-1 bg-cyan-400/20 h-1/4" />
          <div className="w-1 bg-cyan-400/80 h-5/6" />
          <div className="w-1 bg-cyan-400/40 h-1/2" />
        </div>
      </div>
    </article>
  );
}
