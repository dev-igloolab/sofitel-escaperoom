import { useCallback, useEffect, useState } from 'react'
import { FloatingMessage } from '../../components/FloatingMessage'
import { useCountdownTimer } from '../../hooks/useCountdownTimer'
import { socket } from '../../lib/socket'
import {
  CHALLENGE_DURATIONS_SECONDS,
  type GameState,
} from '../../shared/game'
import { LightChallengeShell } from './LightChallengeShell'
import {
  ChallengeIntro,
  type ChallengeIntroStep,
} from './WordChallengeScreen'

type ChallengeThreeView = 'intro' | 'activation'
type FeedbackState = 'success' | 'timeout' | null

const durationSeconds = CHALLENGE_DURATIONS_SECONDS.challenge_3
const introSteps: ChallengeIntroStep[] = [
  {
    body: (
      <>
        El sistema está a punto de
        <br />
        colapsar... y solo{' '}
        <span className="text-[#b51c1f]">el pulso</span>
        <br />
        <span className="text-[#b51c1f]">sincronizado</span> de todo el
        <br />
        equipo podrá reactivarlo.
      </>
    ),
  },
  {
    body: (
      <>
        Conéctense, <span className="text-[#b51c1f]">alineen</span>
        <br />
        <span className="text-[#b51c1f]">su energía</span> y demuestren que la
        <br />
        verdadera fuerza nace cuando
        <br />
        todos actúan como uno.
      </>
    ),
  },
  {
    body: (
      <>
        ¡Están a solo un paso de
        <br />
        convertirse en <span className="text-[#b51c1f]">el equipo</span>
        <br />
        <span className="text-[#b51c1f]">ganador</span>!
      </>
    ),
  },
]
const padLayouts: Record<number, Array<{ left: string; top: string }>> = {
  1: [{ left: '50%', top: '48%' }],
  2: [
    { left: '24%', top: '30%' },
    { left: '76%', top: '72%' },
  ],
  3: [
    { left: '22%', top: '31%' },
    { left: '55%', top: '22%' },
    { left: '77%', top: '70%' },
  ],
  4: [
    { left: '19%', top: '28%' },
    { left: '81%', top: '28%' },
    { left: '25%', top: '75%' },
    { left: '75%', top: '75%' },
  ],
  5: [
    { left: '16%', top: '31%' },
    { left: '50%', top: '20%' },
    { left: '84%', top: '31%' },
    { left: '28%', top: '76%' },
    { left: '72%', top: '76%' },
  ],
}

function getParticipantCount(gameState: GameState) {
  return Math.max(1, Math.min(gameState.group?.participants.length ?? 1, 5))
}

function supportsTouchInput() {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
}

export function ChallengeThreeScreen({ gameState }: { gameState: GameState }) {
  const participantCount = getParticipantCount(gameState)
  const [view, setView] = useState<ChallengeThreeView>('intro')
  const [introStepIndex, setIntroStepIndex] = useState(0)
  const [activePads, setActivePads] = useState<Set<number>>(() => new Set())
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [usesTouchInput, setUsesTouchInput] = useState(supportsTouchInput)

  const timerIsRunning = feedback === null
  const handleTimeout = useCallback(() => setFeedback('timeout'), [])
  const { formattedTime, secondsLeft } = useCountdownTimer({
    durationSeconds,
    isRunning: timerIsRunning,
    onTimeout: handleTimeout,
  })

  useEffect(() => {
    function updateInputMode() {
      setUsesTouchInput(supportsTouchInput())
    }

    updateInputMode()
    window.addEventListener('resize', updateInputMode)

    return () => window.removeEventListener('resize', updateInputMode)
  }, [])

  useEffect(() => {
    const backgroundImage =
      view === 'activation' ? '/images/fondo-2-base.png' : '/images/fondo-1.png'

    window.dispatchEvent(
      new CustomEvent('app-background-change', { detail: backgroundImage }),
    )

    return () => {
      window.dispatchEvent(
        new CustomEvent('app-background-change', {
          detail: '/images/fondo-1.png',
        }),
      )
    }
  }, [view])

  function activatePad(index: number) {
    if (feedback) return

    setActivePads((current) => {
      const nextPads = new Set(current)
      nextPads.add(index)

      if (view === 'activation' && nextPads.size >= participantCount) {
        window.setTimeout(() => setFeedback('success'), 0)
      }

      return nextPads
    })
  }

  function releasePad(index: number) {
    if (feedback) return

    setActivePads((current) => {
      const nextPads = new Set(current)
      nextPads.delete(index)
      return nextPads
    })
  }

  function togglePad(index: number) {
    if (feedback) return

    setActivePads((current) => {
      const nextPads = new Set(current)

      if (nextPads.has(index)) {
        nextPads.delete(index)
      } else {
        nextPads.add(index)
      }

      if (view === 'activation' && nextPads.size >= participantCount) {
        window.setTimeout(() => setFeedback('success'), 0)
      }

      return nextPads
    })
  }

  function goToNextIntroStep() {
    if (introStepIndex < introSteps.length - 1) {
      setIntroStepIndex((current) => current + 1)
      return
    }

    setView('activation')
  }

  function completeChallenge() {
    completeChallengeWithSeconds(secondsLeft)
  }

  function completeChallengeWithSeconds(secondsToScore: number) {
    socket.emit('completeChallenge', {
      challengeId: 'challenge_3',
      secondsLeft: secondsToScore,
    })
    socket.emit('showRanking')
  }

  return (
    <div className="relative h-full w-full">
      {view === 'intro' && (
        <ChallengeIntro
          formattedTime={formattedTime}
          step={introSteps[introStepIndex]}
          onNext={goToNextIntroStep}
        />
      )}

      {view === 'activation' && (
        <ActivationStage
          activePads={activePads}
          participantCount={participantCount}
          onActivate={activatePad}
          onRelease={releasePad}
          onToggle={togglePad}
          usesTouchInput={usesTouchInput}
          formattedTime={formattedTime}
        />
      )}

      {feedback === 'success' && (
        <FloatingMessage
          actionLabel="FINALIZAR MISIÓN"
          body="Todos los puntos fueron activados al mismo tiempo."
          icon={
            <img
              alt=""
              className="h-[66px] w-[66px] object-contain"
              src="/images/check.png"
            />
          }
          onAction={completeChallenge}
          title="RETO COMPLETADO"
          variant="correct"
        />
      )}

      {feedback === 'timeout' && (
        <FloatingMessage
          actionLabel="FINALIZAR MISIÓN"
          body="Les faltó confiar más en ustedes mismos y en su equipo."
          eyebrow="¡EL TIEMPO ACABÓ!"
          icon={
            <img
              alt=""
              className="h-[124px] w-[124px] object-contain"
              src="/images/alerta.png"
            />
          }
          onAction={() => completeChallengeWithSeconds(0)}
          title="MISIÓN FALLIDA"
          variant="timeout"
        />
      )}
    </div>
  )
}

function ActivationStage({
  activePads,
  formattedTime,
  onActivate,
  onRelease,
  onToggle,
  participantCount,
  usesTouchInput,
}: {
  activePads: Set<number>
  formattedTime: string
  onActivate: (index: number) => void
  onRelease: (index: number) => void
  onToggle: (index: number) => void
  participantCount: number
  usesTouchInput: boolean
}) {
  const padPositions = padLayouts[participantCount]
  const activeCount = activePads.size
  const isSynchronizing = activeCount > 0

  return (
    <LightChallengeShell formattedTime={formattedTime}>
      <div className="absolute left-1/2 top-[250px] z-10 h-[610px] w-[1400px] -translate-x-1/2">
        {padPositions.map((position, index) => {
          const isActive = activePads.has(index)

          return (
            <button
              aria-label={`Punto ${index + 1}`}
              className={`absolute flex h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 select-none items-center justify-center rounded-full bg-transparent transition [touch-action:none] focus:outline-none focus:ring-0 ${
                isActive
                  ? 'scale-115 drop-shadow-[0_0_24px_rgba(31,155,104,0.72)]'
                  : 'hover:scale-105'
              }`}
              key={index}
              onClick={() => {
                if (!usesTouchInput) {
                  onToggle(index)
                }
              }}
              onContextMenu={(event) => event.preventDefault()}
              onPointerCancel={() => {
                if (usesTouchInput) {
                  onRelease(index)
                }
              }}
              onPointerDown={(event) => {
                if (usesTouchInput) {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  onActivate(index)
                }
              }}
              onPointerLeave={() => {
                if (usesTouchInput) {
                  onRelease(index)
                }
              }}
              onPointerUp={(event) => {
                if (usesTouchInput) {
                  event.currentTarget.releasePointerCapture(event.pointerId)
                  onRelease(index)
                }
              }}
              style={position}
              type="button"
            >
              {isActive && (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute h-[188px] w-[188px] animate-ping rounded-full bg-[#31a56f]/22 [animation-duration:1.35s]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute h-[232px] w-[232px] animate-spin [animation-duration:2.4s]"
                  >
                    <span className="absolute left-1/2 top-0 h-[11px] w-[11px] -translate-x-1/2 rounded-full bg-[#2ca66e] shadow-[0_0_14px_rgba(44,166,110,0.9)]" />
                    <span className="absolute bottom-[22px] left-[24px] h-[8px] w-[8px] rounded-full bg-[#64c99b] shadow-[0_0_12px_rgba(100,201,155,0.85)]" />
                    <span className="absolute bottom-[22px] right-[24px] h-[8px] w-[8px] rounded-full bg-[#64c99b] shadow-[0_0_12px_rgba(100,201,155,0.85)]" />
                  </span>
                </>
              )}
              <img
                alt=""
                className={`pointer-events-none relative z-10 h-[215px] w-[215px] select-none object-contain transition duration-300 ${
                  isActive
                    ? 'scale-110 hue-rotate-[86deg] saturate-[1.45]'
                    : 'animate-[pulse_2.8s_ease-in-out_infinite]'
                }`}
                draggable={false}
                src="/images/mano.png"
              />
            </button>
          )
        })}
      </div>

      <div className="absolute bottom-[240px] left-1/2 z-20 w-[440px] -translate-x-1/2">
        <div className="mb-[11px] flex items-center justify-center gap-[10px] text-[18px] font-extrabold uppercase tracking-[0.12em] text-[#b63a46]">
          {isSynchronizing && (
            <span className="relative flex h-[13px] w-[13px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2ca66e]/70" />
              <span className="relative inline-flex h-[13px] w-[13px] rounded-full bg-[#2ca66e]" />
            </span>
          )}
          <span>
            {isSynchronizing ? 'Sincronizando equipo' : 'Esperando activación'}
          </span>
        </div>

        <div className="flex h-[18px] gap-[8px] rounded-full bg-[#d99ca2]/28 p-[4px] shadow-inner">
          {padPositions.map((_, index) => {
            const segmentIsActive = activePads.has(index)

            return (
              <span
                aria-hidden="true"
                className={`relative h-full flex-1 overflow-hidden rounded-full transition-all duration-300 ${
                  segmentIsActive
                    ? 'bg-[#2ca66e] shadow-[0_0_12px_rgba(44,166,110,0.58)]'
                    : 'bg-[#c36a73]/28'
                }`}
                key={index}
              >
                {segmentIsActive && (
                  <span className="absolute inset-y-0 left-[-55%] w-1/2 animate-[pulse_0.9s_ease-in-out_infinite] skew-x-[-18deg] bg-white/45" />
                )}
              </span>
            )
          })}
        </div>
      </div>
    </LightChallengeShell>
  )
}
