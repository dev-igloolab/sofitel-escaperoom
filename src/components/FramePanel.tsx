import type { CSSProperties, ReactNode } from 'react'

type FramePanelProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
}

const panelClipPath =
  'polygon(4.2% 0, 100% 0, 100% 88%, 95.8% 100%, 0 100%, 0 8.6%)'

const panelShapeStyle: CSSProperties = {
  clipPath: panelClipPath,
}

const panelDots = [
  ['17%', '32%', '7px', 'bg-[#8e18ff]/80'],
  ['27%', '46%', '8px', 'bg-[#8e18ff]/80'],
  ['38%', '30%', '9px', 'bg-[#8e18ff]/80'],
  ['52%', '26%', '8px', 'bg-[#16d2c6]/70'],
  ['64%', '44%', '9px', 'bg-[#8e18ff]/80'],
  ['77%', '31%', '8px', 'bg-[#8e18ff]/80'],
  ['83%', '63%', '8px', 'bg-[#8e18ff]/80'],
  ['62%', '73%', '8px', 'bg-[#8e18ff]/75'],
  ['50%', '76%', '9px', 'bg-[#8e18ff]/75'],
  ['35%', '70%', '9px', 'bg-[#8e18ff]/75'],
  ['22%', '84%', '7px', 'bg-[#8e18ff]/75'],
  ['72%', '83%', '7px', 'bg-[#8e18ff]/75'],
] as const

export function FramePanel({
  children,
  className = '',
  contentClassName = '',
}: FramePanelProps) {
  return (
    <section className={`relative overflow-visible ${className}`}>
      <div
        className="absolute inset-0 z-0"
        style={panelShapeStyle}
        aria-hidden="true"
      >
        <span className="absolute right-[2.1%] top-[4.6%] h-[18px] w-[12%] bg-[#7b22e4]/65 [clip-path:polygon(0_0,100%_0,100%_100%,30%_100%)]" />
        <span className="absolute right-[2.1%] top-[4.6%] h-[18%] w-px bg-[#cf27ff]/42" />
        <span className="absolute bottom-[5.6%] left-[2.4%] h-[18px] w-[12%] bg-[#7b22e4]/65 [clip-path:polygon(0_0,70%_0,100%_100%,0_100%)]" />
        <span className="absolute bottom-[5.6%] left-[2.4%] h-[20%] w-px bg-[#cf27ff]/42" />
        {panelDots.map(([left, top, size, color]) => (
          <span
            key={`${left}-${top}`}
            className={`absolute rounded-full ${color} opacity-70`}
            style={{ left, top, width: size, height: size }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(121,28,224,0.24)_0%,rgba(35,50,132,0.34)_46%,rgba(4,28,74,0.5)_100%)] backdrop-blur-[0.5px]"
        style={panelShapeStyle}
        aria-hidden="true"
      />

      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon
          points="4,0 100.15,0 100.15,88.15 95.9,100.15 -0.15,100.15 -0.15,8.45"
          fill="none"
          stroke="#ff2bd6"
          strokeOpacity="0.7"
          strokeWidth="0.36"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points="4.2,0 100,0 100,88 95.8,100 0,100 0,8.6"
          fill="none"
          stroke="#d61cff"
          strokeOpacity="1"
          strokeWidth="0.7"
          filter="url(#panelGlow)"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points="4.6,0.8 99.2,0.8 99.2,87.2 95.3,98.9 0.8,98.9 0.8,9"
          fill="none"
          stroke="#7a22ff"
          strokeOpacity="0.36"
          strokeWidth="0.22"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points="4,0.35 99.55,0.35 99.55,87.75 95.55,99.55 0.35,99.55 0.35,8.75"
          fill="none"
          stroke="#ff31d9"
          strokeOpacity="0.28"
          strokeWidth="0.2"
          vectorEffect="non-scaling-stroke"
        />
        <defs>
          <filter id="panelGlow" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="0.45" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className={`relative z-30 ${contentClassName}`}>{children}</div>
    </section>
  )
}
