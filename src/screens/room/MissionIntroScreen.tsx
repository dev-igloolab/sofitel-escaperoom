import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ActionButton } from '../../components/ActionButton'
import { BrandLockup } from '../../components/BrandLockup'
import { FramePanel } from '../../components/FramePanel'
import { LegalFooter } from '../../components/LegalFooter'
import { socket } from '../../lib/socket'

const STAGE_WIDTH = 1920
const STAGE_HEIGHT = 1080

export function MissionIntroScreen() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoActive, setIsVideoActive] = useState(false)
  const [videoScale, setVideoScale] = useState(1)

  useEffect(() => {
    function updateVideoScale() {
      setVideoScale(
        Math.min(
          window.innerWidth / STAGE_WIDTH,
          window.innerHeight / STAGE_HEIGHT,
        ),
      )
    }

    updateVideoScale()
    window.addEventListener('resize', updateVideoScale)

    return () => window.removeEventListener('resize', updateVideoScale)
  }, [])

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
        <div className="relative aspect-video h-auto max-h-[980px] w-[94%]">
          <svg
            className="pointer-events-none absolute -inset-[12px] z-20 h-[calc(100%+24px)] w-[calc(100%+24px)] overflow-visible"
            viewBox="0 0 100 56.25"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon
              points="1.8,0 100,0 100,54.25 98.2,56.25 0,56.25 0,2"
              fill="none"
              stroke="#ff31d9"
              strokeOpacity="0.35"
              strokeWidth="0.26"
              vectorEffect="non-scaling-stroke"
            />
            <polygon
              points="2.1,0.55 99.45,0.55 99.45,53.85 97.9,55.7 0.55,55.7 0.55,2.4"
              fill="none"
              stroke="#d61cff"
              strokeOpacity="0.95"
              strokeWidth="0.78"
              filter="url(#videoFrameGlow)"
              vectorEffect="non-scaling-stroke"
            />
            <polygon
              points="2.45,1.05 98.95,1.05 98.95,53.45 97.55,55.15 1.05,55.15 1.05,2.75"
              fill="none"
              stroke="#7a22ff"
              strokeOpacity="0.46"
              strokeWidth="0.28"
              vectorEffect="non-scaling-stroke"
            />
            <defs>
              <filter
                id="videoFrameGlow"
                x="-5%"
                y="-5%"
                width="110%"
                height="110%"
              >
                <feGaussianBlur stdDeviation="0.34" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          <video
            ref={videoRef}
            className="h-full w-full object-cover [clip-path:polygon(2.1%_0.55%,99.45%_0.55%,99.45%_95.25%,97.9%_99%,0.55%_99%,0.55%_4.3%)]"
            onEnded={goToExperienceIntro}
            playsInline
            preload="auto"
            src="/videos/introduccion.mp4"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative h-full w-full">
      {typeof document === 'undefined'
        ? videoOverlay
        : createPortal(videoOverlay, document.body)}

      <FramePanel
        className="absolute left-[140px] top-[80px] h-[760px] w-[1640px]"
        contentClassName="flex h-full min-w-0 flex-col items-center px-[56px] pb-0 pt-[48px] text-center"
      >
        <BrandLockup className="shrink-0" />

        <div className="flex min-w-0 flex-1 items-center justify-center">
          <div className="-translate-y-3">
            <p className="text-[30px] font-bold uppercase leading-none tracking-[0.26em] text-white">
              AQUÍ COMIENZA:
            </p>
            <h1 className="mt-[36px] max-w-full whitespace-nowrap font-display text-[66px] uppercase leading-none tracking-[0.065em] text-[#28e6b2]">
              EL CÓDIGO DE LA ACCIÓN
            </h1>
            <p className="mx-auto mt-[64px] max-w-[920px] text-[35px] font-bold leading-[1.35] tracking-[0.18em] text-white">
              La siguiente decisión puede cambiar el futuro de un paciente.
            </p>
          </div>
        </div>

        <ActionButton className="-mb-7" onClick={playIntroVideo}>
          INICIAR MISIÓN
        </ActionButton>
      </FramePanel>

      <LegalFooter className="absolute bottom-[58px] left-1/2 -translate-x-1/2" />
    </div>
  )
}
