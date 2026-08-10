type InfoBadgeProps = {
  children: string
  className?: string
  labelClassName?: string
  side?: 'left' | 'right'
}

const badgeClipPaths = {
  left: 'polygon(0 0, 100% 0, 100% 100%, 12% 100%, 0 58%)',
  right: 'polygon(0 0, 100% 0, 100% 58%, 88% 100%, 0 100%)',
}

export function InfoBadge({
  children,
  className = '',
  labelClassName = '',
  side = 'left',
}: InfoBadgeProps) {
  const barClass =
    side === 'left'
      ? 'ml-auto mr-0 w-[72%]'
      : 'ml-0 mr-auto w-[66%]'

  return (
    <div className={`flex w-[196px] flex-col ${className}`}>
      <div
        className="relative h-[42px] bg-[#6d17df] shadow-[0_0_18px_rgba(142,24,255,0.32)]"
        style={{ clipPath: badgeClipPaths[side] }}
      >
        <div
          className="absolute inset-[2px] flex items-center justify-center bg-[linear-gradient(90deg,#05002f_0%,#0b0642_48%,#12075a_100%)] px-[16px]"
          style={{ clipPath: badgeClipPaths[side] }}
        >
          <span
            className={`whitespace-nowrap font-display text-[18px] uppercase leading-none tracking-[0.03em] text-white ${labelClassName}`}
          >
            {children}
          </span>
        </div>
      </div>
      <span
        className={`mt-2 h-[5px] bg-[#16d2c6] shadow-[0_0_14px_rgba(22,210,198,0.36)] ${barClass}`}
        aria-hidden="true"
      />
    </div>
  )
}
