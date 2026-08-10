import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type FloatingMessageVariant = 'correct' | 'incorrect' | 'level-up' | 'timeout'

type FloatingMessageProps = {
  body?: ReactNode
  bodyClassName?: string
  containerClassName?: string
  title: ReactNode
  actionLabel?: string
  eyebrow?: string
  icon?: ReactNode
  onAction?: () => void
  variant: FloatingMessageVariant
}

const variantStyles: Record<
  FloatingMessageVariant,
  {
    header: string
    panel: string
    title: string
  }
> = {
  correct: {
    header: 'bg-[#19003a]',
    panel: 'bg-white text-[#180038]',
    title: 'text-[#43d17d]',
  },
  incorrect: {
    header: 'bg-[#ff075b]',
    panel: 'bg-white text-[#180038]',
    title: 'text-white',
  },
  'level-up': {
    header: 'bg-[#cc0049]',
    panel: 'bg-[linear-gradient(180deg,#4ab4cf_0%,#1497b3_100%)] text-white',
    title: 'text-[#fff200]',
  },
  timeout: {
    header: 'bg-[#cc0049]',
    panel: 'bg-[linear-gradient(180deg,#e94b6b_0%,#b72b57_100%)] text-white',
    title: 'text-white',
  },
}

const messageClipPath =
  'polygon(6% 0,100% 0,100% 82%,94% 100%,0 100%,0 18%)'

const STAGE_WIDTH = 1920
const STAGE_HEIGHT = 1080

function FloatingMessageOverlay({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function updateScale() {
      setScale(
        Math.min(
          window.innerWidth / STAGE_WIDTH,
          window.innerHeight / STAGE_HEIGHT,
        ),
      )
    }

    updateScale()
    window.addEventListener('resize', updateScale)

    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#15002f]/78 backdrop-blur-[1px]">
      <div
        className="relative flex h-[1080px] w-[1920px] shrink-0 origin-center items-center justify-center"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  )

  if (typeof document === 'undefined') {
    return content
  }

  return createPortal(content, document.body)
}

export function FloatingMessage({
  actionLabel,
  body,
  bodyClassName = '',
  containerClassName,
  eyebrow,
  icon,
  onAction,
  title,
  variant,
}: FloatingMessageProps) {
  const styles = variantStyles[variant]
  const isCorrect = variant === 'correct'

  if (variant === 'timeout') {
    return (
      <FloatingMessageOverlay>
        <div className="relative w-full max-w-[900px]">
          <svg
            className="pointer-events-none absolute -inset-x-[8px] -inset-y-[7px] z-20 h-[calc(100%+14px)] w-[calc(100%+16px)] overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon
              points="6,0 100,0 100,82 94,100 0,100 0,18"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.95"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <section
            className="relative bg-[linear-gradient(180deg,#e84b66_0%,#bf2854_100%)] text-white shadow-2xl shadow-black/50"
            style={{ clipPath: messageClipPath }}
            role="dialog"
            aria-modal="true"
          >
            <div className="relative z-10 grid min-h-[214px] grid-cols-[270px_1fr] bg-[linear-gradient(90deg,#cc0049_0%,#cc0049_34%,#ed526b_34%,#ed526b_100%)]">
              <div className="flex items-center justify-center pl-[42px]">
                {icon}
              </div>
              <div className="flex flex-col justify-center px-[54px] text-left">
                {eyebrow && (
                  <p className="whitespace-nowrap font-display text-[40px] uppercase leading-[0.95] tracking-[0.03em] text-white">
                    {eyebrow}
                  </p>
                )}
                <h2 className="mt-[6px] font-display text-[34px] uppercase leading-[1.05] tracking-[0.03em] text-[#fff200]">
                  {title}
                </h2>
              </div>
            </div>

            <div className="relative z-10 border-t-[3px] border-white/95 px-[138px] pb-[56px] pt-[28px] text-left text-[30px] font-bold leading-[1.16]">
              {body}
            </div>

            {actionLabel && onAction && (
              <button
                className="relative z-10 mx-auto mt-[-30px] block min-w-[300px] rounded-t-lg bg-white px-12 py-4 font-display text-[24px] uppercase tracking-[0.08em] text-[#cc0049] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#28e6b2]/50"
                onClick={onAction}
                type="button"
              >
                {actionLabel}
              </button>
            )}
          </section>
        </div>
      </FloatingMessageOverlay>
    )
  }

  if (variant === 'level-up') {
    const isCompactNotice = !title

    return (
      <FloatingMessageOverlay>
        <div
          className={`relative w-full ${
            isCompactNotice ? 'max-w-[980px]' : 'max-w-[860px]'
          }`}
        >
          <svg
            className="pointer-events-none absolute -inset-x-[8px] -inset-y-[7px] z-20 h-[calc(100%+14px)] w-[calc(100%+16px)] overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon
              points="6,0 100,0 100,82 94,100 0,100 0,18"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.95"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <section
            className="relative bg-[#28a8c3] text-white shadow-2xl shadow-black/50"
            style={{ clipPath: messageClipPath }}
            role="dialog"
            aria-modal="true"
          >
            <div
              className={`relative z-10 flex items-center justify-center gap-[18px] bg-[#cc0049] px-[64px] py-[22px] text-center ${
                isCompactNotice ? 'min-h-[88px]' : ''
              }`}
            >
              {isCompactNotice && icon && (
                <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center">
                  {icon}
                </span>
              )}
              {eyebrow && (
                <p className="font-display text-[30px] uppercase leading-none tracking-[0.08em] text-[#fff200]">
                  {eyebrow}
                </p>
              )}
            </div>

            <div className="relative z-10 bg-[linear-gradient(180deg,#43b7d1_0%,#159cb8_100%)] px-[86px] pb-[86px] pt-[24px]">
              <div
                className={`mx-auto ${
                  isCompactNotice ? 'max-w-[790px]' : 'max-w-[700px]'
                }`}
              >
                {title && (
                  <h2 className="whitespace-nowrap font-display text-[42px] uppercase leading-[1.02] tracking-[0.1em] text-white">
                    {title}
                  </h2>
                )}
                <div
                  className={`items-center gap-[22px] ${
                    isCompactNotice
                      ? 'text-center'
                      : 'mt-[20px] grid grid-cols-[88px_1fr] text-left'
                  }`}
                >
                  {title && <div className="flex justify-center">{icon}</div>}
                  <div className="text-[28px] font-medium leading-[1.16]">
                    {body}
                  </div>
                </div>
              </div>
            </div>

            {actionLabel && onAction && (
              <button
                className="relative z-10 mx-auto mt-[-62px] block min-w-[330px] rounded-t-lg bg-white px-12 py-4 font-display text-[23px] uppercase tracking-[0.08em] text-[#cc0049] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#28e6b2]/50"
                onClick={onAction}
                type="button"
              >
                {actionLabel}
              </button>
            )}
          </section>
        </div>
      </FloatingMessageOverlay>
    )
  }

  return (
    <FloatingMessageOverlay>
      <div
        className={`relative w-full ${
          containerClassName ?? (isCorrect ? 'max-w-[1500px]' : 'max-w-[1260px]')
        }`}
      >
        <svg
          className="pointer-events-none absolute -inset-x-[9px] -inset-y-[7px] z-20 h-[calc(100%+14px)] w-[calc(100%+18px)] overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points="6,0 100,0 100,82 94,100 0,100 0,18"
            fill="none"
            stroke="#d31cff"
            strokeOpacity="0.95"
            strokeWidth="0.72"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <section
          className={`relative shadow-2xl shadow-black/50 ${styles.panel}`}
          style={{ clipPath: messageClipPath }}
          role="dialog"
          aria-modal="true"
        >

          <div
            className={`relative z-10 flex items-center justify-center text-center ${styles.header} ${
              isCorrect
                ? 'min-h-[118px] px-[92px]'
                : 'min-h-[112px] gap-[24px] px-[72px]'
            }`}
          >
            {icon && (
              <span
                className={`flex h-[66px] w-[66px] shrink-0 items-center justify-center ${
                  isCorrect ? 'absolute left-[58px]' : ''
                }`}
              >
                {icon}
              </span>
            )}
            <div className={isCorrect ? 'w-full' : ''}>
              {eyebrow && (
                <p className="font-display text-[34px] uppercase leading-none tracking-[0.08em] text-[#fff200]">
                  {eyebrow}
                </p>
              )}
              <h2
                className={`font-display uppercase leading-none ${styles.title} ${
                  isCorrect
                    ? 'text-[54px] tracking-[0.085em]'
                    : 'text-[58px] tracking-[0.14em]'
                }`}
              >
                {title}
              </h2>
            </div>
          </div>

          {body && (
            <div
              className={`relative z-10 text-center font-medium leading-[1.18] ${
                isCorrect
                  ? 'px-[138px] py-[42px] text-[40px]'
                  : 'px-[88px] py-[38px] text-[38px]'
              } ${bodyClassName}`}
            >
              {body}
            </div>
          )}

          {actionLabel && onAction && (
            <button
              className={`relative z-10 mx-auto mb-[-1px] block rounded-t-lg bg-[linear-gradient(90deg,#f80560,#ff2d76)] px-14 py-4 font-display text-[24px] uppercase tracking-[0.12em] text-white transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#28e6b2]/50 ${
                isCorrect ? 'min-w-[430px]' : 'min-w-[330px]'
              }`}
              onClick={onAction}
              type="button"
            >
              {actionLabel}
            </button>
          )}
        </section>
      </div>
    </FloatingMessageOverlay>
  )
}
