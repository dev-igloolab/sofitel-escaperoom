import { useEffect, useState, type ReactNode } from 'react'
import { useStageScale } from '../hooks/useStageScale'

type AppLayoutProps = {
  children: ReactNode
  showFooter?: boolean
}

export function AppLayout({
  children,
  showFooter = true,
}: AppLayoutProps) {
  const scale = useStageScale()
  const [backgroundImage, setBackgroundImage] = useState('/images/fondo-1.png')

  useEffect(() => {
    function handleBackgroundChange(event: Event) {
      setBackgroundImage((event as CustomEvent<string>).detail)
    }

    window.addEventListener('app-background-change', handleBackgroundChange)

    return () => {
      window.removeEventListener('app-background-change', handleBackgroundChange)
    }
  }, [])

  return (
    <main className="relative flex h-svh w-full items-center justify-center overflow-hidden bg-[#05090d] font-sans text-white">
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={backgroundImage}
        alt=""
        aria-hidden="true"
      />
      {backgroundImage === '/images/fondo-1.png' && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), radial-gradient(circle at center, rgba(181,28,31,0.06), rgba(5,9,13,0.36) 48%, rgba(2,6,10,0.52))',
          }}
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
