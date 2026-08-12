import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useStageScale } from '../hooks/useStageScale'
import { ActionButton } from './ActionButton'

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

const messageClipPath =
  'polygon(7% 0,100% 0,100% 82%,93% 100%,0 100%,0 18%)'

const variantConfig: Record<
  FloatingMessageVariant,
  {
    header: string
    sizeClass: string
    title: string
  }
> = {
  correct: {
    header: 'bg-[#1f9b68]',
    sizeClass: 'max-w-[980px]',
    title: 'text-white',
  },
  incorrect: {
    header: 'bg-[#b51c1f]',
    sizeClass: 'max-w-[980px]',
    title: 'text-white',
  },
  'level-up': {
    header: 'bg-[#fff1f2]',
    sizeClass: 'max-w-[1040px]',
    title: 'text-[#b51c1f]',
  },
  timeout: {
    header: 'bg-[#b51c1f]',
    sizeClass: 'max-w-[1080px]',
    title: 'text-white',
  },
}

function FloatingMessageOverlay({ children }: { children: ReactNode }) {
  const scale = useStageScale()

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/58 backdrop-blur-[1.5px]">
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
  const config = variantConfig[variant]
  const isTimeout = variant === 'timeout'

  return (
    <FloatingMessageOverlay>
      <div className={`relative w-full ${containerClassName ?? config.sizeClass}`}>
        <section
          className="relative overflow-hidden bg-[#fff4f5] text-[#251313] shadow-[0_26px_74px_rgba(0,0,0,0.42)]"
          style={{ clipPath: messageClipPath }}
          role="dialog"
          aria-modal="true"
        >
          <div className={`relative z-10 ${config.header}`}>
            <div
              className={`flex items-center justify-center gap-[28px] px-[84px] text-center ${
                isTimeout ? 'min-h-[174px] py-[26px]' : 'min-h-[142px] py-[24px]'
              }`}
            >
              {icon && (
                <span className="flex shrink-0 items-center justify-center">
                  {icon}
                </span>
              )}

              <div className="min-w-0">
                {eyebrow && (
                  <p
                    className={`mb-[12px] font-just text-[24px] font-extrabold uppercase leading-none tracking-[0.16em] ${
                      isTimeout ? 'text-white' : 'text-[#b51c1f]'
                    }`}
                  >
                    {eyebrow}
                  </p>
                )}
                <h2
                  className={`font-just text-[48px] font-extrabold uppercase leading-[1.02] tracking-[0.04em] ${config.title}`}
                >
                  {title}
                </h2>
              </div>
            </div>
          </div>

          {body && (
            <div
              className={`relative z-10 mx-auto max-w-[820px] px-[72px] pb-[96px] pt-[44px] text-center font-just text-[32px] font-semibold leading-[1.2] text-[#2b1717] ${bodyClassName}`}
            >
              {body}
            </div>
          )}

          {actionLabel && onAction && (
            <div className="absolute bottom-[28px] left-1/2 z-20 -translate-x-1/2">
              <ActionButton
                className="min-w-[360px] !px-[44px] !py-[14px] !text-[24px]"
                onClick={onAction}
                type="button"
              >
                {actionLabel}
              </ActionButton>
            </div>
          )}
        </section>
      </div>
    </FloatingMessageOverlay>
  )
}
