export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
      {/* Subtle glow */}
      <div className="absolute -inset-8 rounded-[3rem] bg-emerald-500/[0.07] blur-3xl" />

      {/* Phone frame */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#0c1322] shadow-[0_0_80px_-20px_rgba(16,185,129,0.12)]">
        {/* Bezel top */}
        <div className="flex items-center justify-center pt-3 pb-0">
          <div className="h-[22px] w-[90px] rounded-full bg-black/80" />
        </div>

        {/* Screen */}
        <div className="px-5 pt-4 pb-3">
          {/* Status bar */}
          <div className="flex items-center justify-between text-[10px] text-white/30 mb-5">
            <span className="font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.24 4.24 0 00-6 0zm-4-4l2 2a7.07 7.07 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium">Status</p>
              <p className="text-white text-base font-semibold mt-0.5 tracking-tight">All good</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>

          {/* Mode selector */}
          <div className="flex gap-2 mb-5">
            {[
              { label: 'Good', color: 'bg-emerald-400', active: true, ring: 'ring-1 ring-emerald-400/40 bg-emerald-400/[0.08]' },
              { label: 'Uncertain', color: 'bg-amber-400', active: false, ring: 'bg-white/[0.03]' },
              { label: 'Crisis', color: 'bg-red-500', active: false, ring: 'bg-white/[0.03]' },
            ].map((m) => (
              <div
                key={m.label}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${m.ring}`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${m.color} ${m.active ? 'shadow-[0_0_6px_currentColor]' : 'opacity-40'}`} />
                <span className={`text-[11px] font-medium ${m.active ? 'text-white' : 'text-white/25'}`}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          {/* Check-in button */}
          <button className="w-full rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-500 py-3 text-[13px] font-semibold text-navy-950 shadow-[0_4px_20px_rgba(52,211,153,0.25)] mb-3">
            I'm okay
          </button>

          {/* Timer */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            <svg className="w-3 h-3 text-white/20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p className="text-[10px] text-white/25 tracking-wide">
              Next check-in in <span className="text-white/40 font-medium">22h 14m</span>
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.04] mb-4" />

          {/* History */}
          <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-medium mb-2.5">
            History
          </p>
          <div className="space-y-1.5">
            {[
              { color: 'bg-emerald-400', time: '2h ago', msg: 'At the hotel', opacity: 'opacity-100' },
              { color: 'bg-emerald-400', time: '26h ago', msg: 'Checked in', opacity: 'opacity-60' },
              { color: 'bg-amber-400', time: '2d ago', msg: 'Flight delayed', opacity: 'opacity-40' },
            ].map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 rounded-lg bg-white/[0.02] px-3 py-2 ${entry.opacity}`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${entry.color} shrink-0`} />
                <span className="text-[11px] text-white/60 flex-1 truncate">
                  {entry.msg}
                </span>
                <span className="text-[10px] text-white/20 shrink-0 tabular-nums">
                  {entry.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2 pt-1">
          <div className="h-[3px] w-[100px] rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  )
}
