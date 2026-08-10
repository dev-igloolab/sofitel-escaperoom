type TimerDisplayProps = {
  time: string
  label: string
  className?: string
}

export function TimerDisplay({
  time,
  label,
  className = '',
}: TimerDisplayProps) {
  const timerClipPath =
    'polygon(12% 0,88% 0,100% 50%,88% 100%,12% 100%,0 50%)'
  const outlineClipPath =
    'polygon(11.3% 0,88.7% 0,100% 50%,88.7% 100%,11.3% 100%,0 50%)'

  return (
    <div className={className}>
      <div className="relative w-[400px] px-[58px] py-[20px] text-center">
        <svg
          className="pointer-events-none absolute -inset-x-[9px] -inset-y-[6px] h-[calc(100%+12px)] w-[calc(100%+18px)] overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points="11.3,0 88.7,0 100,50 88.7,100 11.3,100 0,50"
            fill="none"
            stroke="#18d7d1"
            strokeOpacity="0.72"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          className="absolute inset-0 bg-[linear-gradient(135deg,#18d7d1_0%,#18d7d1_46%,#c022ff_62%,#c022ff_100%)]"
          style={{ clipPath: timerClipPath }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-[4px] bg-[#05002f]"
          style={{ clipPath: timerClipPath }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-[7px] bg-[linear-gradient(90deg,#04002b_0%,#0b0642_42%,#151064_58%,#05002f_100%)] shadow-[inset_0_0_42px_rgba(44,22,122,0.48)]"
          style={{ clipPath: outlineClipPath }}
          aria-hidden="true"
        />
        <span
          className="absolute left-1/2 top-[4px] h-[13px] w-[34%] -translate-x-1/2 rounded-b-[14px] bg-[linear-gradient(90deg,#a618e9,#e13bff)] shadow-[0_0_18px_rgba(224,59,255,0.58)]"
          aria-hidden="true"
        />
        <span
          className="absolute bottom-[4px] left-1/2 h-[13px] w-[34%] -translate-x-1/2 rounded-t-[14px] bg-[linear-gradient(90deg,#a618e9,#e13bff)] shadow-[0_0_18px_rgba(224,59,255,0.58)]"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <p className="font-display text-[54px] leading-none tracking-[0.06em] text-white">
            {time}
          </p>
          <span
            className="mx-auto mt-3 block h-px w-[88%] bg-[linear-gradient(90deg,#18d7d1_0%,#22c8d0_48%,#c022ff_100%)]"
            aria-hidden="true"
          />
          <p className="mt-2 font-display text-[14px] uppercase tracking-[0.46em] text-white">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}
