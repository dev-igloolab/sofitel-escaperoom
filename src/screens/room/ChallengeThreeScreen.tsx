import { useEffect, useMemo, useState } from 'react'
import { ActionButton } from '../../components/ActionButton'
import { FloatingMessage } from '../../components/FloatingMessage'
import { FramePanel } from '../../components/FramePanel'
import { TimerDisplay } from '../../components/TimerDisplay'
import { socket } from '../../lib/socket'
import {
  CHALLENGE_DURATIONS_SECONDS,
  type GameState,
} from '../../shared/game'
import { BriefTag } from './ChallengeBriefTag'

type ChallengeThreeView = 'intro' | 'activation'
type FeedbackState = 'success' | 'timeout' | null

const durationSeconds = CHALLENGE_DURATIONS_SECONDS.challenge_3
const padLayouts: Record<number, Array<{ left: string; top: string }>> = {
  1: [{ left: '50%', top: '54%' }],
  2: [
    { left: '34%', top: '54%' },
    { left: '66%', top: '54%' },
  ],
  3: [
    { left: '50%', top: '36%' },
    { left: '34%', top: '64%' },
    { left: '66%', top: '64%' },
  ],
  4: [
    { left: '34%', top: '38%' },
    { left: '66%', top: '38%' },
    { left: '34%', top: '68%' },
    { left: '66%', top: '68%' },
  ],
  5: [
    { left: '50%', top: '32%' },
    { left: '28%', top: '52%' },
    { left: '72%', top: '52%' },
    { left: '38%', top: '73%' },
    { left: '62%', top: '73%' },
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
  const [activePads, setActivePads] = useState<Set<number>>(() => new Set())
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)
  const [usesTouchInput, setUsesTouchInput] = useState(supportsTouchInput)

  const timerIsRunning = feedback === null
  const formattedTime = useMemo(
    () =>
      `${Math.floor(secondsLeft / 60)
        .toString()
        .padStart(2, '0')}:${(secondsLeft % 60).toString().padStart(2, '0')}`,
    [secondsLeft],
  )

  useEffect(() => {
    if (!timerIsRunning) return

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          setFeedback('timeout')
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [timerIsRunning])

  useEffect(() => {
    function updateInputMode() {
      setUsesTouchInput(supportsTouchInput())
    }

    updateInputMode()
    window.addEventListener('resize', updateInputMode)

    return () => window.removeEventListener('resize', updateInputMode)
  }, [])

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

  function restartChallenge() {
    setFeedback(null)
    setActivePads(new Set())
    setSecondsLeft(durationSeconds)
    setView('intro')
  }

  function completeChallenge() {
    socket.emit('completeChallenge', {
      challengeId: 'challenge_3',
      secondsLeft,
    })
    socket.emit('showRanking')
  }

  return (
    <div className="relative h-full w-full">
      <ChallengeThreeTitle />

      <div className="absolute right-[132px] top-[32px] z-30">
        <TimerDisplay
          className="origin-top-right scale-[1.02]"
          time={formattedTime}
          label="MINUTOS"
        />
      </div>

      {view === 'intro' && (
        <ChallengeThreeIntro
          participantCount={participantCount}
          onContinue={() => setView('activation')}
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
        />
      )}

      {feedback === 'success' && (
        <FloatingMessage
          actionLabel="FINALIZAR MISION"
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
          actionLabel="REINICIAR RETO"
          body={
            <>
              El tiempo se agoto.
              <br />
              <br />
              Coordinen al equipo y vuelvan a activar todos los puntos.
            </>
          }
          eyebrow="EL BEAT SE DETUVO"
          icon={
            <img
              alt=""
              className="h-[124px] w-[124px] object-contain"
              src="/images/alerta.png"
            />
          }
          onAction={restartChallenge}
          title="LA MISION NO SE COMPLETO A TIEMPO."
          variant="timeout"
        />
      )}
    </div>
  )
}

function ChallengeThreeTitle() {
  return (
    <div className="absolute left-[225px] top-[62px] z-30 flex h-[76px] w-[760px] items-center overflow-hidden rounded-[12px] border-[3px] border-[#d31cff] bg-[#8d00ef]/38 shadow-[0_0_22px_rgba(197,28,255,0.3)] backdrop-blur-[0.5px]">
      <span className="flex h-full w-[190px] items-center justify-center rounded-r-[12px] bg-[#fff200] font-display text-[32px] uppercase tracking-[0.04em] text-[#21003f]">
        Reto 3:
      </span>
      <span className="flex h-full flex-1 items-center justify-center bg-[linear-gradient(90deg,rgba(139,0,232,0.36),rgba(168,24,242,0.3))] px-[28px] text-[34px] font-bold uppercase leading-none text-white">
        Activacion en equipo
      </span>
    </div>
  )
}

function ChallengeThreeIntro({
  onContinue,
  participantCount,
}: {
  onContinue: () => void
  participantCount: number
}) {
  return (
    <>
      <FramePanel
        className="absolute left-[108px] top-[100px] h-[875px] w-[1704px]"
        contentClassName="flex h-full min-w-0 flex-col items-center px-[150px] pb-[118px] pt-[162px] text-center"
      >
        <div className="flex w-full max-w-[1260px] justify-center gap-[24px]">
          <BriefTag className="w-[324px]">1 minuto</BriefTag>
          <BriefTag className="w-[420px]">
            {`${participantCount} punto${participantCount === 1 ? '' : 's'}`}
          </BriefTag>
          <BriefTag className="w-[420px]">Presion simultanea</BriefTag>
        </div>

        <div className="mt-[150px] flex items-center justify-center">
          <span className="relative z-10 -mr-[20px] flex h-[62px] w-[62px] translate-x-[6px] items-center justify-center rounded-full bg-black">
            <img
              alt=""
              className="h-[44px] w-[44px] object-contain"
              src="/images/meta.png"
            />
          </span>
          <h1 className="bg-[#bb63ff] px-[30px] py-[10px] pl-[34px] text-[42px] font-extrabold uppercase leading-none text-white">
            Desafio:
          </h1>
        </div>

        <p className="mt-[28px] max-w-[1120px] text-[34px] font-medium leading-[1.24] text-white">
          Cada participante debe activar un punto en pantalla.
          <br />
          Mantengan todos los puntos presionados al mismo tiempo para completar el reto.
        </p>
      </FramePanel>

      <div className="absolute bottom-[70px] left-1/2 z-30 -translate-x-1/2">
        <ActionButton className="w-[430px] px-[68px] text-[30px]" onClick={onContinue}>
          Continuar
        </ActionButton>
      </div>
    </>
  )
}

function ActivationStage({
  activePads,
  onActivate,
  onRelease,
  onToggle,
  participantCount,
  usesTouchInput,
}: {
  activePads: Set<number>
  onActivate: (index: number) => void
  onRelease: (index: number) => void
  onToggle: (index: number) => void
  participantCount: number
  usesTouchInput: boolean
}) {
  const padPositions = padLayouts[participantCount]

  return (
    <FramePanel
      className="absolute left-[108px] top-[100px] h-[875px] w-[1704px]"
      contentClassName="relative h-full min-w-0 px-[120px] pb-[94px] pt-[120px] text-center"
    >
      <h1 className="text-[42px] font-extrabold uppercase leading-none text-white">
        {usesTouchInput
          ? 'Activen todos los puntos al mismo tiempo'
          : 'Activen todos los puntos'}
      </h1>

      <p className="mt-[18px] text-[25px] font-bold leading-tight text-white/90">
        {activePads.size} de {participantCount} activos
        {!usesTouchInput && ' · modo PC'}
      </p>

      <div className="absolute inset-x-[120px] bottom-[92px] top-[220px]">
        {padPositions.map((position, index) => {
          const isActive = activePads.has(index)

          return (
            <button
              aria-label={`Punto ${index + 1}`}
              className={`absolute flex h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 select-none items-center justify-center rounded-full transition [touch-action:none] focus:outline-none focus:ring-4 focus:ring-[#28e6b2]/60 ${
                isActive
                  ? 'scale-110 bg-[#28e6b2]/12 drop-shadow-[0_0_34px_rgba(40,230,178,0.9)]'
                  : 'drop-shadow-[0_0_20px_rgba(22,210,198,0.42)] hover:scale-105'
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
              <img
                alt=""
                className={`h-[178px] w-[178px] object-contain transition ${
                  isActive
                    ? 'brightness-0 saturate-100 invert-[87%] sepia-[74%] saturate-[494%] hue-rotate-[89deg] brightness-[104%] contrast-[94%]'
                    : 'brightness-0 invert'
                }`}
                src="/images/mano.png"
              />
            </button>
          )
        })}
      </div>
    </FramePanel>
  )
}
