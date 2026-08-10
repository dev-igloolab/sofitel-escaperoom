import type { ReactNode } from 'react'
import { useStageScale } from '../hooks/useStageScale'

type AppLayoutProps = {
  children: ReactNode
  background?: 'plain' | 'framed'
  showFooter?: boolean
}

const backgroundImages = {
  plain: '/images/fondo-1.png',
  framed: '/images/fondo-2.png',
}

export function AppLayout({
  children,
  background = 'plain',
  showFooter = true,
}: AppLayoutProps) {
  const scale = useStageScale()

  return (
    <main className="relative flex h-svh w-full items-center justify-center overflow-hidden bg-[#21003f] font-sans text-white">
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={backgroundImages[background]}
        alt=""
        aria-hidden="true"
      />
      {background === 'plain' && (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(173,0,255,0.18),rgba(20,0,40,0.35)_56%,rgba(10,0,24,0.72))]"
          aria-hidden="true"
        />
      )}
      <section
        className="relative h-[1080px] w-[1920px] shrink-0 origin-center overflow-hidden"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {children}
        </div>

        {showFooter && (
          <footer className="pointer-events-none absolute bottom-[44px] left-[96px] right-[96px] z-20 flex items-end justify-between">
            <img
              className="h-auto w-[128px]"
              src="/images/beat.png"
              alt="Next Beat"
            />
            <img
              className="h-auto w-[112px]"
              src="/images/sanofi.png"
              alt="Sanofi"
            />
          </footer>
        )}
      </section>
    </main>
  )
}
