import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ActionButton } from '../../components/ActionButton'
import { FloatingMessage } from '../../components/FloatingMessage'
import { FramePanel } from '../../components/FramePanel'
import { useCountdownTimer } from '../../hooks/useCountdownTimer'
import { DarkChallengeBrief } from './DarkChallengeBrief'
import { LightChallengeShell } from './LightChallengeShell'

type ChallengeView = 'intro' | 'brief' | 'answer'
type FeedbackState = 'correct' | 'incorrect' | 'level-up' | 'timeout' | null
type AnswerMode = 'word' | 'numeric'

export type ChallengeIntroStep = {
  body: ReactNode
  showTimer?: boolean
  stepNumber?: string
}

export type WordAnswerResult = {
  aliases: string[]
  body: ReactNode
  status: 'correct' | 'incorrect'
}

type WordChallengeScreenProps = {
  answerMode?: AnswerMode
  answerPrompt?: string
  answers: WordAnswerResult[]
  briefBody: ReactNode
  briefTags: string[]
  challengeLabel: string
  correctTitle?: string
  durationSeconds: number
  fallbackIncorrectBody: ReactNode
  levelUpBody: ReactNode
  levelUpTitle: ReactNode
  nextActionLabel: string
  onComplete: (secondsLeft: number) => void
  introSteps?: ChallengeIntroStep[]
  showLevelUp?: boolean
  title: string
}

const letters = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['LIMPIAR', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ESPACIO', 'BORRAR'],
]
const numericKeys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['LIMPIAR', '0', 'BORRAR'],
]

function normalizeAnswer(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-CO')
    .replace(/[^a-z0-9]/g, '')
}

export function WordChallengeScreen({
  answerMode = 'word',
  answerPrompt,
  answers,
  briefBody,
  briefTags,
  challengeLabel,
  correctTitle = 'CORRECTO',
  durationSeconds,
  fallbackIncorrectBody,
  levelUpBody,
  levelUpTitle,
  nextActionLabel,
  onComplete,
  introSteps = [],
  showLevelUp = true,
  title,
}: WordChallengeScreenProps) {
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [answerResult, setAnswerResult] = useState<WordAnswerResult | null>(null)
  const [view, setView] = useState<ChallengeView>(
    introSteps.length > 0 ? 'intro' : 'brief',
  )
  const [introStepIndex, setIntroStepIndex] = useState(0)

  const isNumericAnswer = answerMode === 'numeric'
  const expectedAnswerLength = Math.max(
    1,
    ...answers.flatMap((candidate) =>
      candidate.aliases.map((alias) => normalizeAnswer(alias).length),
    ),
  )
  const activeIntroStep = introSteps[introStepIndex]
  const resolvedAnswerPrompt =
    answerPrompt ??
    (isNumericAnswer
      ? 'Digite el código del reto:'
      : 'Cuando tengan la palabra, digítela aquí:')
  const isPaused = feedback !== null
  const handleTimeout = useCallback(() => setFeedback('timeout'), [])
  const { formattedTime, reset, secondsLeft } = useCountdownTimer({
    durationSeconds,
    isRunning: !isPaused,
    onTimeout: handleTimeout,
  })

  const checkAnswerValue = useCallback((value: string) => {
    if (!value.trim()) return

    const normalizedAnswer = normalizeAnswer(value)
    const matchedAnswer = answers.find((candidate) =>
      candidate.aliases.includes(normalizedAnswer),
    )
    const result = matchedAnswer ?? {
      aliases: [],
      body: fallbackIncorrectBody,
      status: 'incorrect' as const,
    }

    setAnswerResult(result)
    setFeedback(result.status)
  }, [answers, fallbackIncorrectBody])

  const addAnswerKey = useCallback((letter: string) => {
    if (feedback) return

    if (letter === 'LIMPIAR') {
      setAnswer('')
      return
    }

    if (letter === 'BORRAR') {
      setAnswer((current) => current.slice(0, -1))
      return
    }

    if (letter === 'ESPACIO') {
      if (isNumericAnswer) return

      setAnswer((current) => `${current} `.slice(0, 42))
      return
    }

    if (isNumericAnswer && !/^\d$/.test(letter)) return

    setAnswer((current) => {
      const nextAnswer = `${current}${letter}`.slice(0, 42)

      if (
        isNumericAnswer &&
        normalizeAnswer(nextAnswer).length >= expectedAnswerLength
      ) {
        window.setTimeout(() => checkAnswerValue(nextAnswer), 0)
      }

      return nextAnswer
    })
  }, [
    checkAnswerValue,
    expectedAnswerLength,
    feedback,
    isNumericAnswer,
  ])

  const checkAnswer = useCallback(() => {
    checkAnswerValue(answer)
  }, [answer, checkAnswerValue])

  useEffect(() => {
    if (view !== 'answer' || feedback) return

    function handleKeyboardInput(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        event.preventDefault()
        checkAnswer()
        return
      }

      if (event.key === 'Backspace') {
        event.preventDefault()
        addAnswerKey('BORRAR')
        return
      }

      if (event.key === 'Delete' || event.key === 'Escape') {
        event.preventDefault()
        addAnswerKey('LIMPIAR')
        return
      }

      if (!isNumericAnswer && event.key === ' ') {
        event.preventDefault()
        addAnswerKey('ESPACIO')
        return
      }

      if (isNumericAnswer && /^\d$/.test(event.key)) {
        event.preventDefault()
        addAnswerKey(event.key)
        return
      }

      if (!isNumericAnswer && /^[a-zñ]$/i.test(event.key)) {
        event.preventDefault()
        addAnswerKey(event.key.toLocaleUpperCase('es-CO'))
      }
    }

    window.addEventListener('keydown', handleKeyboardInput)

    return () => window.removeEventListener('keydown', handleKeyboardInput)
  }, [addAnswerKey, checkAnswer, feedback, isNumericAnswer, view])

  useEffect(() => {
    const backgroundImage =
      view === 'answer' ? '/images/fondo-2-base.png' : '/images/fondo-1.png'

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

  function restartChallenge() {
    setAnswer('')
    setAnswerResult(null)
    setFeedback(null)
    reset()
    setIntroStepIndex(0)
    setView(introSteps.length > 0 ? 'intro' : 'brief')
  }

  function goToNextIntroStep() {
    if (introStepIndex < introSteps.length - 1) {
      setIntroStepIndex((current) => current + 1)
      return
    }

    setView('answer')
  }

  return (
    <div className="relative h-full w-full">
      {view === 'intro' && activeIntroStep ? (
        <ChallengeIntro
          formattedTime={formattedTime}
          step={activeIntroStep}
          onNext={goToNextIntroStep}
        />
      ) : view === 'answer' ? (
        <LightChallengeAnswer
          answer={answer}
          answerMode={answerMode}
          disabled={Boolean(feedback)}
          formattedTime={formattedTime}
          onKeyPress={addAnswerKey}
          onSubmit={checkAnswer}
        />
      ) : view === 'brief' ? (
        <DarkChallengeBrief
          actionLabel="Responder"
          body={briefBody}
          challengeLabel={challengeLabel}
          formattedTime={formattedTime}
          onAction={() => setView('answer')}
          tags={briefTags}
          title={title}
        />
      ) : (
        <FramePanel className="hidden" contentClassName="hidden">
          <ChallengeAnswer
            answer={answer}
            answerMode={answerMode}
            answerPrompt={resolvedAnswerPrompt}
            disabled={Boolean(feedback)}
            onKeyPress={addAnswerKey}
            onSubmit={checkAnswer}
          />
        </FramePanel>
      )}

      {feedback === 'incorrect' && (
        <FloatingMessage
          actionLabel="REINTENTAR"
          body={answerResult?.body ?? fallbackIncorrectBody}
          icon={
            <img
              alt=""
              className="h-[66px] w-[66px] object-contain"
              src="/images/error.png"
            />
          }
          onAction={() => {
            setFeedback(null)
            setAnswerResult(null)
            setAnswer('')
          }}
          title="DESCARTADO"
          variant="incorrect"
        />
      )}

      {feedback === 'correct' && (
        <FloatingMessage
          actionLabel={showLevelUp ? 'CONTINUAR' : nextActionLabel}
          body={answerResult?.body}
          icon={
            <img
              alt=""
              className="h-[66px] w-[66px] object-contain"
              src="/images/check.png"
            />
          }
          onAction={() => {
            if (showLevelUp) {
              setFeedback('level-up')
              return
            }

            onComplete(secondsLeft)
          }}
          title={correctTitle}
          variant="correct"
        />
      )}

      {feedback === 'level-up' && (
        <FloatingMessage
          actionLabel={nextActionLabel}
          body={levelUpBody}
          eyebrow="-LEVEL UP!-"
          icon={
            <img
              alt=""
              className="h-[88px] w-[88px] object-contain"
              src="/images/copa.png"
            />
          }
          onAction={() => onComplete(secondsLeft)}
          title={levelUpTitle}
          variant="level-up"
        />
      )}

      {feedback === 'timeout' && (
        <FloatingMessage
          actionLabel="REINICIAR RETO"
          body="Les faltó confiar más en ustedes mismos y en su equipo."
          eyebrow="¡EL TIEMPO ACABÓ!"
          icon={
            <img
              alt=""
              className="h-[124px] w-[124px] object-contain"
              src="/images/alerta.png"
            />
          }
          onAction={restartChallenge}
          title="MISIÓN FALLIDA"
          variant="timeout"
        />
      )}
    </div>
  )
}

function ChallengeIntro({
  formattedTime,
  onNext,
  step,
}: {
  formattedTime: string
  onNext: () => void
  step: ChallengeIntroStep
}) {
  return (
    <section className="absolute inset-0 flex h-full w-full flex-col items-center justify-center px-[190px] pb-[150px] pt-[118px] text-center font-just">
      {step.showTimer && (
        <div className="absolute right-[150px] top-[82px] z-10 rounded-[8px] border border-white/80 bg-black/22 px-[18px] py-[10px]">
          <p className="text-[52px] font-extrabold leading-none tracking-[0.02em] text-white">
            {formattedTime}
          </p>
        </div>
      )}

      <div className="relative z-10 flex min-h-[470px] w-full max-w-[1420px] items-center justify-center">
        {step.stepNumber && (
          <span className="pointer-events-none absolute left-[10px] top-1/2 -translate-y-1/2 text-[340px] font-light leading-none text-[#b51c1f]/86">
            {step.stepNumber}
          </span>
        )}

        <div className="relative z-10 max-w-[1360px] text-[66px] font-extrabold uppercase leading-[1.18] tracking-[0.015em] text-white">
          {step.body}
        </div>
      </div>

      <button
        aria-label="Continuar"
        className="absolute bottom-[118px] right-[120px] z-10 h-[190px] w-[190px] select-none rounded-full border-0 bg-transparent p-0 transition hover:scale-105 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none"
        onClick={onNext}
        type="button"
      >
        <img
          alt=""
          className="pointer-events-none h-full w-full select-none object-contain"
          draggable={false}
          src="/images/boton.webp"
        />
      </button>

      <img
        alt="Laboratorios Legrand"
        className="absolute bottom-[65px] left-1/2 z-10 h-auto w-[210px] -translate-x-1/2"
        src="/images/laboratorio.webp"
      />
    </section>
  )
}

function ChallengeAnswer({
  answer,
  answerMode,
  answerPrompt,
  disabled,
  onKeyPress,
  onSubmit,
}: {
  answer: string
  answerMode: AnswerMode
  answerPrompt: string
  disabled: boolean
  onKeyPress: (letter: string) => void
  onSubmit: () => void
}) {
  const isNumericAnswer = answerMode === 'numeric'
  const keyRows = isNumericAnswer ? numericKeys : letters

  return (
    <div className="flex h-full min-w-0 flex-col items-center justify-center">
      <h1 className="text-[27px] font-extrabold uppercase leading-tight tracking-[0.03em] text-white">
        {answerPrompt}
      </h1>

      {isNumericAnswer ? (
        <div className="mt-10 flex items-center justify-center gap-[42px]">
          <div
            className="relative flex h-[250px] w-[350px] flex-col justify-between border border-[#d31cff]/70 bg-[#12002c]/86 p-[18px] shadow-[0_0_34px_rgba(211,28,255,0.24)] [clip-path:polygon(9%_0,100%_0,100%_84%,91%_100%,0_100%,0_16%)]"
          >
            <div
              className="pointer-events-none absolute inset-x-[22px] bottom-[26px] h-px bg-[#28e6b2]/55"
              aria-hidden="true"
            />
            <div className="flex h-[74px] items-center justify-center border border-[#28e6b2]/65 bg-white px-5 text-center font-display text-[42px] uppercase tracking-[0.18em] text-[#180038] shadow-[0_0_20px_rgba(40,230,178,0.2)] [clip-path:polygon(4%_0,100%_0,100%_82%,96%_100%,0_100%,0_18%)]">
              {answer || '---'}
            </div>
            <div className="grid flex-1 place-items-center">
              <p className="font-display text-[28px] uppercase tracking-[0.12em] text-[#28e6b2]/80">
                Código
              </p>
            </div>
          </div>
          <Keypad
            disabled={disabled}
            mode={answerMode}
            rows={keyRows}
            onKeyPress={onKeyPress}
          />
        </div>
      ) : (
        <>
          <div className="mt-7 flex h-[80px] w-[760px] items-center justify-center bg-white px-8 text-center text-[42px] font-bold uppercase tracking-[0.18em] text-[#180038] [clip-path:polygon(2%_0,100%_0,100%_82%,98%_100%,0_100%,0_18%)]">
            {answer || '_'}
          </div>

          <Keypad
            className="mt-8 w-full max-w-[1040px]"
            disabled={disabled}
            mode={answerMode}
            rows={keyRows}
            onKeyPress={onKeyPress}
          />
        </>
      )}

      <button
        className="mt-6 rounded-xl bg-black px-[86px] py-4 font-display text-[29px] uppercase tracking-[0.18em] text-white transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-45"
        disabled={disabled || !answer.trim()}
        onClick={onSubmit}
        type="button"
      >
        Comprobar
      </button>
    </div>
  )
}

export function NumericChallengeAnswer({
  answer,
  disabled,
  formattedTime,
  onKeyPress,
}: {
  answer: string
  disabled: boolean
  formattedTime: string
  onKeyPress: (letter: string) => void
}) {
  return (
    <LightChallengeShell formattedTime={formattedTime}>
      <h1 className="absolute left-1/2 top-[380px] z-10 w-[1040px] -translate-x-1/2 text-[36px] font-extrabold uppercase leading-none tracking-[0.01em] text-black">
        Busquen la esencia de{' '}
        <span className="text-[#b51c1f]">nuestros valores</span>
      </h1>

      <div className="absolute left-1/2 top-[458px] z-10 flex -translate-x-1/2 items-start justify-center gap-[74px]">
        <div className="flex h-[360px] w-[300px] flex-col rounded-[27px] bg-[#b3333e] px-[30px] pb-[26px] pt-[44px] shadow-[0_18px_36px_rgba(117,20,28,0.18)]">
          <div className="flex h-[60px] items-center justify-center rounded-[14px] bg-white/95 px-6 text-[34px] font-extrabold uppercase tracking-[0.2em] text-[#b3333e]">
            {answer || ''}
          </div>
          <div className="flex flex-1 items-center justify-center">
            <span className="text-[0px]">Código</span>
          </div>
        </div>

        <Keypad
          className="w-[320px]"
          disabled={disabled}
          mode="numeric"
          rows={numericKeys}
          onKeyPress={onKeyPress}
        />
      </div>

    </LightChallengeShell>
  )
}

function LightChallengeAnswer({
  answer,
  answerMode,
  disabled,
  formattedTime,
  onKeyPress,
  onSubmit,
}: {
  answer: string
  answerMode: AnswerMode
  disabled: boolean
  formattedTime: string
  onKeyPress: (letter: string) => void
  onSubmit: () => void
}) {
  const isNumericAnswer = answerMode === 'numeric'
  const keyRows = isNumericAnswer ? numericKeys : letters

  return (
    <LightChallengeShell formattedTime={formattedTime}>
      {isNumericAnswer && (
        <h1 className="absolute left-1/2 top-[380px] z-10 w-[1120px] -translate-x-1/2 text-[36px] font-extrabold uppercase leading-none tracking-[0.01em] text-black">
          Busquen la esencia de{' '}
          <span className="text-[#b51c1f]">nuestros valores</span>
        </h1>
      )}

      <div
        className={`absolute left-1/2 z-10 flex -translate-x-1/2 justify-center ${
          isNumericAnswer
            ? 'top-[458px] items-start gap-[74px]'
            : 'top-[392px] flex-col items-center'
        }`}
      >
        {isNumericAnswer ? (
          <div className="flex h-[360px] w-[300px] flex-col rounded-[27px] bg-[#b3333e] px-[30px] pb-[26px] pt-[44px] shadow-[0_18px_36px_rgba(117,20,28,0.18)]">
            <div className="flex h-[60px] items-center justify-center rounded-[14px] bg-white/95 px-6 text-[34px] font-extrabold uppercase tracking-[0.2em] text-[#b3333e]">
              {answer || ''}
            </div>
            <div className="flex flex-1 items-center justify-center">
              <span className="text-[0px]">Codigo</span>
            </div>
          </div>
        ) : (
          <div className="flex h-[86px] w-[860px] items-center justify-center rounded-[14px] bg-white/95 px-10 text-[42px] font-extrabold uppercase tracking-[0.22em] text-[#b3333e] shadow-[0_16px_34px_rgba(117,20,28,0.16)]">
            {answer || (
              <span className="text-[#d5d5d8]">{'_'.repeat(3)}</span>
            )}
          </div>
        )}

        <Keypad
          className={isNumericAnswer ? 'w-[320px]' : 'mt-[42px] w-[1060px]'}
          disabled={disabled}
          mode={answerMode}
          rows={keyRows}
          onKeyPress={onKeyPress}
        />

        {!isNumericAnswer && (
          <ActionButton
            className="mt-[30px] w-[430px]"
            disabled={disabled || !answer.trim()}
            onClick={onSubmit}
          >
            Comprobar
          </ActionButton>
        )}
      </div>

    </LightChallengeShell>
  )
}

function Keypad({
  className = '',
  disabled,
  mode,
  onKeyPress,
  rows,
}: {
  className?: string
  disabled: boolean
  mode: AnswerMode
  onKeyPress: (letter: string) => void
  rows: string[][]
}) {
  const isNumericAnswer = mode === 'numeric'

  return (
    <div className={`flex flex-col ${isNumericAnswer ? 'gap-[18px]' : 'gap-3'} ${className}`}>
      {rows.map((row) => (
        <div
          className={`flex justify-center ${
            isNumericAnswer ? 'gap-[26px]' : 'flex-wrap gap-[12px]'
          }`}
          key={row.join('')}
        >
          {row.map((key) => {
            const isAction = key === 'BORRAR' || key === 'LIMPIAR'
            const isSpace = key === 'ESPACIO'

            return (
              <button
                className={
                  isNumericAnswer
                    ? `h-[74px] rounded-[14px] font-just text-[34px] font-extrabold leading-none text-white shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition focus:outline-none focus:ring-4 focus:ring-[#b51c1f]/35 ${
                        isAction
                          ? 'w-[74px] bg-[#9c9c9a] text-[0px] hover:brightness-105'
                          : 'w-[74px] bg-black hover:brightness-125'
                      }`
                    : `min-h-[62px] rounded-[8px] px-4 font-just text-white shadow-[0_10px_18px_rgba(78,8,12,0.28)] transition focus:outline-none focus:ring-4 focus:ring-[#b51c1f]/30 ${
                        isAction
                          ? 'min-w-[118px] bg-[#c7801c] text-[18px] font-extrabold'
                          : isSpace
                            ? 'min-w-[170px] bg-[linear-gradient(180deg,#bd2024,#971217)] text-[18px] font-extrabold'
                            : 'min-w-[74px] bg-[linear-gradient(180deg,#bd2024,#971217)] text-[38px] font-extrabold hover:brightness-110'
                      }`
                }
                disabled={disabled}
                key={key}
                onClick={() => onKeyPress(key)}
                type="button"
              >
                {isNumericAnswer && isAction ? (
                  <span className="sr-only">{key}</span>
                ) : (
                  key
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
