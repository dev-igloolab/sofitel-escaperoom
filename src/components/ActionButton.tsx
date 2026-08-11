import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ActionButtonProps = {
  children: ReactNode
  tone?: 'default' | 'yellow' | 'white'
} & ButtonHTMLAttributes<HTMLButtonElement>

const buttonClipPath =
  'polygon(0 0, 95% 0, 100% 50%, 100% 100%, 5% 100%, 0 66%)'
const whiteButtonClipPath =
  'polygon(0 0, 93% 0, 100% 50%, 100% 100%, 7% 100%, 0 50%)'

export function ActionButton({
  children,
  className = '',
  tone = 'default',
  ...buttonProps
}: ActionButtonProps) {
  const isWhite = tone === 'white'
  const clipPath = isWhite ? whiteButtonClipPath : buttonClipPath
  const fillClass = isWhite ? 'bg-white' : 'bg-[#a8171b]'
  const innerFillClass = isWhite ? 'bg-white' : 'bg-[#b51c1f]'
  const strokeColor = isWhite ? '#c9a24a' : '#c9a24a'
  const polygonPoints = isWhite
    ? '0,0 93,0 100,50 100,100 7,100 0,50'
    : '0,0 95,0 100,50 100,100 5,100 0,66'
  const textClass = isWhite ? 'text-[#b51c1f]' : 'text-white'
  const underlineClass = isWhite ? 'bg-[#b51c1f]' : 'bg-white'

  return (
    <button
      className={`group relative inline-flex min-w-[220px] max-w-full items-center justify-center bg-transparent px-[56px] py-[16px] font-just text-[26px] font-extrabold uppercase leading-none tracking-[0.02em] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#c9a24a]/55 disabled:cursor-not-allowed disabled:brightness-90 ${textClass} ${className}`}
      {...buttonProps}
    >
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon
          points={polygonPoints}
          fill="none"
          stroke={strokeColor}
          strokeOpacity="1"
          strokeWidth="1.7"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        className={`absolute inset-0 ${fillClass}`}
        style={{ clipPath }}
        aria-hidden="true"
      />
      <span
        className={`absolute inset-[1px] ${innerFillClass}`}
        style={{ clipPath }}
        aria-hidden="true"
      />
      <span
        className={`absolute bottom-[1px] left-1/2 h-[4px] w-[22%] -translate-x-1/2 rounded-t-[5px] ${underlineClass}`}
        aria-hidden="true"
      />
      <span className="relative z-10 inline-flex min-w-0 items-center justify-center whitespace-nowrap">
        <ButtonChevrons direction="left" tone={tone} />
        <span>{children}</span>
        <ButtonChevrons direction="right" tone={tone} />
      </span>
    </button>
  )
}

function ButtonChevrons({
  direction,
  tone,
}: {
  direction: 'left' | 'right'
  tone: ActionButtonProps['tone']
}) {
  const chevronClass =
    direction === 'left'
      ? 'rotate-45 border-b-[3px] border-l-[3px]'
      : 'rotate-45 border-r-[3px] border-t-[3px]'

  const borderClass = tone === 'white' ? 'border-[#b51c1f]' : 'border-white'

  return (
    <span
      className={`inline-flex shrink-0 gap-[8px] ${direction === 'left' ? 'mr-[24px]' : 'ml-[24px]'}`}
      aria-hidden="true"
    >
      <span className={`h-[18px] w-[18px] ${borderClass} ${chevronClass}`} />
      <span className={`h-[18px] w-[18px] ${borderClass} ${chevronClass}`} />
    </span>
  )
}
