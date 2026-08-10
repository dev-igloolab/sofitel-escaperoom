import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ActionButtonProps = {
  children: ReactNode
  tone?: 'default' | 'yellow'
} & ButtonHTMLAttributes<HTMLButtonElement>

const buttonClipPath =
  'polygon(0 60%, 0 0, 95% 0, 100% 40%, 100% 100%, 5% 100%)'

export function ActionButton({
  children,
  className = '',
  tone = 'default',
  ...buttonProps
}: ActionButtonProps) {
  const toneClass =
    tone === 'yellow'
      ? 'text-[#fff200] [text-shadow:0_0_8px_rgba(255,242,0,0.36)]'
      : 'text-white'

  return (
    <button
      className={`group relative inline-flex min-w-[220px] max-w-full items-center justify-center bg-transparent px-[56px] py-[20px] font-display text-[28px] uppercase leading-none tracking-[0.12em] transition hover:scale-[1.015] focus:outline-none focus:ring-4 focus:ring-[#28e6b2]/60 ${toneClass} ${className}`}
      {...buttonProps}
    >
      <svg
        className="pointer-events-none absolute -inset-x-[6px] -inset-y-[5px] h-[calc(100%+10px)] w-[calc(100%+12px)] overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon
          points="0,60 0,0 95,0 100,40 100,100 5,100"
          fill="none"
          stroke="#8e18ff"
          strokeOpacity="0.48"
          strokeWidth="0.55"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        className="absolute inset-0 bg-[#8e18ff]"
        style={{ clipPath: buttonClipPath }}
        aria-hidden="true"
      />
      <span className="absolute inset-[1px] bg-black [clip-path:polygon(0_59%,0_0,95%_0,100%_41%,100%_100%,5%_100%)]" />
      <span
        className="absolute bottom-[1px] left-1/2 h-[5px] w-[25%] -translate-x-1/2 rounded-t-[6px] bg-[#c022ff]"
        aria-hidden="true"
      />
      <span className="relative z-10 inline-flex min-w-0 items-center justify-center whitespace-nowrap">
        <ButtonChevrons direction="left" />
        <span>{children}</span>
        <ButtonChevrons direction="right" />
      </span>
    </button>
  )
}

function ButtonChevrons({ direction }: { direction: 'left' | 'right' }) {
  const chevronClass =
    direction === 'left'
      ? 'rotate-45 border-b-[4px] border-l-[4px]'
      : 'rotate-45 border-r-[4px] border-t-[4px]'

  return (
    <span
      className={`inline-flex shrink-0 gap-[8px] ${direction === 'left' ? 'mr-[24px]' : 'ml-[24px]'}`}
      aria-hidden="true"
    >
      <span className={`h-[20px] w-[20px] border-[#9a20ff] ${chevronClass}`} />
      <span className={`h-[20px] w-[20px] border-[#9a20ff] ${chevronClass}`} />
    </span>
  )
}
