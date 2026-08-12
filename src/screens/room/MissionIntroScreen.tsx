import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ActionButton } from '../../components/ActionButton'
import { useStageScale } from '../../hooks/useStageScale'
import { socket } from '../../lib/socket'
import { OutsideBranding } from '../outside/OutsideBranding'

export function MissionIntroScreen() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoActive, setIsVideoActive] = useState(false)
  const videoScale = useStageScale()

  function goToExperienceIntro() {
    socket.emit('startGame')
  }

  function playIntroVideo() {
    setIsVideoActive(true)

    const video = videoRef.current

    if (!video) {
      goToExperienceIntro()
      return
    }

    video.currentTime = 0
    void video.play().catch(() => {
      goToExperienceIntro()
    })
  }

  const videoOverlay = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/72 transition-opacity duration-300 ${
        isVideoActive
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
            <div className="h-full w-full bg-black [clip-path:polygon(2.65%_0%,100%_0%,100%_92.75%,96.65%_100%,0%_100%,0%_7.25%)]">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                onEnded={goToExperienceIntro}
                playsInline
                preload="auto"
                src="/videos/introduccion.mp4"
              />
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
        <div className="mt-[32px] flex items-center justify-center gap-5">
          <span className="h-px w-[120px] bg-white/55" />
          <p className="text-[22px] font-extrabold uppercase leading-none tracking-[0.02em] text-white">
            Prepárense para descubrir la esencia del código
          </p>
          <span className="h-px w-[120px] bg-white/55" />
        </div>

        <ActionButton className="mt-[72px] w-[520px]" onClick={playIntroVideo}>
          INICIAR MISIÓN
        </ActionButton>
      </section>
    </div>
  )
}
