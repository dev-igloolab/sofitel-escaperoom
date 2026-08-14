import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ActionButton } from '../../components/ActionButton'
import { useStageScale } from '../../hooks/useStageScale'
import { socket } from '../../lib/socket'
import { OutsideBranding } from '../outside/OutsideBranding'

export function MissionIntroScreen() {
  const [isCountdownActive, setIsCountdownActive] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const videoScale = useStageScale()

  function goToExperienceIntro() {
    socket.emit('startGame')
  }

  function startIntroCountdown() {
    setCountdown(3)
    setIsCountdownActive(true)
  }

  useEffect(() => {
    if (!isCountdownActive) return

    if (countdown <= 0) {
      goToExperienceIntro()
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCountdown((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [countdown, isCountdownActive])

  const videoOverlay = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/72 transition-opacity duration-300 ${
        isCountdownActive
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      }`}
    >
      <div
        className="relative flex h-[1080px] w-[1920px] shrink-0 origin-center items-center justify-center"
        style={{ transform: `scale(${videoScale})` }}
      >
        <div className="relative aspect-video h-auto max-h-[900px] w-[88%] bg-[#c49a3b] p-[3px] shadow-[0_34px_90px_rgba(0,0,0,0.58)] [clip-path:polygon(3.2%_0%,100%_0%,100%_92.4%,96.1%_100%,0%_100%,0%_8.1%)]">
          <div className="h-full w-full bg-[#b51c1f] p-[13px] [clip-path:polygon(3.2%_0%,100%_0%,100%_92.4%,96.1%_100%,0%_100%,0%_8.1%)]">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black [clip-path:polygon(2.65%_0%,100%_0%,100%_92.75%,96.65%_100%,0%_100%,0%_7.25%)]">
              <div className="absolute inset-0 bg-[url('/images/fondo-1.png')] bg-cover bg-center opacity-35" />
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative z-10 flex flex-col items-center text-center font-just text-white">
                <p className="text-[34px] font-extrabold uppercase tracking-[0.18em] text-[#c9a24a]">
                  Iniciando misión
                </p>
                <div className="mt-[34px] flex h-[220px] w-[220px] items-center justify-center rounded-full border-[5px] border-white/82 bg-[#b51c1f] shadow-[0_0_54px_rgba(181,28,31,0.55)]">
                  <span className="text-[118px] font-extrabold leading-none">
                    {countdown}
                  </span>
                </div>
                <p className="mt-[38px] max-w-[720px] text-[30px] font-extrabold uppercase leading-tight">
                  Prepárense para comenzar el primer reto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative h-full w-full">
      {typeof document === 'undefined'
        ? videoOverlay
        : createPortal(videoOverlay, document.body)}

      <section className="relative flex h-full w-full flex-col items-center justify-center px-[120px] text-center font-just">
        <OutsideBranding />

        <p className="text-[31px] font-extrabold uppercase leading-none tracking-[0.16em] text-white">
          ¡Equipo registrado!
        </p>
        <h1 className="mt-[30px] max-w-[1220px] whitespace-nowrap text-[72px] font-extrabold uppercase leading-none text-white">
          La misión <span className="text-[#b51c1f]">está por comenzar</span>
        </h1>

        <ActionButton className="mt-[72px] w-[520px]" onClick={startIntroCountdown}>
          INICIAR MISIÓN
        </ActionButton>
      </section>
    </div>
  )
}
