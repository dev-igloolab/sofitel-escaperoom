import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ActionButton } from '../../components/ActionButton'
import { FloatingMessage } from '../../components/FloatingMessage'
import { FramePanel } from '../../components/FramePanel'
import { TimerDisplay } from '../../components/TimerDisplay'
import { useCountdownTimer } from '../../hooks/useCountdownTimer'
import { BriefTag } from './ChallengeBriefTag'
import { ChallengeTitle } from './ChallengeTitle'

type ChallengeView = 'brief' | 'answer'
type FeedbackState = 'correct' | 'incorrect' | 'level-up' | 'timeout' | null

export type WordAnswerResult = {
  aliases: string[]
  body: ReactNode
  status: 'correct' | 'incorrect'
}

type WordChallengeScreenProps = {
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
  title: string
}

const letters = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['LIMPIAR', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ESPACIO', 'BORRAR'],
]

function normalizeAnswer(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-CO')
    .replace(/[^a-z0-9]/g, '')
}

export function WordChallengeScreen({
  answerPrompt = 'Cuando tengan la palabra, digitela aqui:',
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
  title,
}: WordChallengeScreenProps) {
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [answerResult, setAnswerResult] = useState<WordAnswerResult | null>(null)
  const [view, setView] = useState<ChallengeView>('brief')

  const isPaused = feedback !== null
  const handleTimeout = useCallback(() => setFeedback('timeout'), [])
  const { formattedTime, reset, secondsLeft } = useCountdownTimer({
    durationSeconds,
    isRunning: !isPaused,
    onTimeout: handleTimeout,
  })

  const addLetter = useCallback((letter: string) => {
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
      setAnswer((current) => `${current} `.slice(0, 42))
      return
    }

    setAnswer((current) => `${current}${letter}`.slice(0, 42))
  }, [feedback])

  const checkAnswer = useCallback(() => {
    if (!answer.trim()) return

    const normalizedAnswer = normalizeAnswer(answer)
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
  }, [answer, answers, fallbackIncorrectBody])

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
        addLetter('BORRAR')
        return
      }

      if (event.key === 'Delete' || event.key === 'Escape') {
        event.preventDefault()
        addLetter('LIMPIAR')
        return
      }

      if (event.key === ' ') {
        event.preventDefault()
        addLetter('ESPACIO')
        return
      }

      if (/^[a-zñ]$/i.test(event.key)) {
        event.preventDefault()
        addLetter(event.key.toLocaleUpperCase('es-CO'))
      }
    }

    window.addEventListener('keydown', handleKeyboardInput)

    return () => window.removeEventListener('keydown', handleKeyboardInput)
  }, [addLetter, checkAnswer, feedback, view])

  function restartChallenge() {
    setAnswer('')
    setAnswerResult(null)
    setFeedback(null)
    reset()
    setView('brief')
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-[225px] top-[62px] z-30">
        <ChallengeTitle challengeLabel={challengeLabel} title={title} />
      </div>
      <div className="absolute right-[132px] top-[32px] z-30">
        <TimerDisplay
          className="origin-top-right scale-[1.02]"
          time={formattedTime}
          label="MINUTOS"
        />
      </div>

      <FramePanel
        className="absolute left-[108px] top-[100px] h-[875px] w-[1704px]"
        contentClassName="flex h-full min-w-0 flex-col items-center px-[150px] pb-[82px] pt-[112px] text-center"
      >
        {view === 'brief' ? (
          <ChallengeBrief briefBody={briefBody} briefTags={briefTags} />
        ) : (
          <ChallengeAnswer
            answer={answer}
            answerPrompt={answerPrompt}
            disabled={Boolean(feedback)}
            onKeyPress={addLetter}
            onSubmit={checkAnswer}
          />
        )}
      </FramePanel>

      {view === 'brief' && (
        <ActionButton
          className="!absolute bottom-[61px] left-1/2 z-30 w-[500px] -translate-x-1/2"
          onClick={() => setView('answer')}
        >
          Responder
        </ActionButton>
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
          actionLabel="CONTINUAR"
          body={answerResult?.body}
          icon={
            <img
              alt=""
              className="h-[66px] w-[66px] object-contain"
              src="/images/check.png"
            />
          }
          onAction={() => setFeedback('level-up')}
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
          body={
            <>
              El tiempo se agoto.
              <br />
              <br />
              Revisen la pista del reto y vuelvan a intentar la palabra correcta.
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

function ChallengeBrief({
  briefBody,
  briefTags,
}: {
  briefBody: ReactNode
  briefTags: string[]
}) {
  return (
    <div className="flex h-full w-full max-w-[1430px] min-w-0 flex-col items-center justify-start">
      <div className="flex w-full flex-wrap justify-center gap-[24px]">
        {briefTags.map((tag) => (
          <BriefTag className="w-[420px]" key={tag}>
            {tag}
          </BriefTag>
        ))}
      </div>

      <div className="mt-[155px] flex items-center justify-center">
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

      <div className="mt-[28px] max-w-[1240px] text-[34px] font-medium leading-[1.24] text-white">
        {briefBody}
      </div>
    </div>
  )
}

function ChallengeAnswer({
  answer,
  answerPrompt,
  disabled,
  onKeyPress,
  onSubmit,
}: {
  answer: string
  answerPrompt: string
  disabled: boolean
  onKeyPress: (letter: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="flex h-full min-w-0 flex-col items-center justify-center">
      <h1 className="text-[27px] font-extrabold uppercase leading-tight tracking-[0.03em] text-white">
        {answerPrompt}
      </h1>

      <div className="mt-7 flex h-[80px] w-[760px] items-center justify-center bg-white px-8 text-center text-[42px] font-bold uppercase tracking-[0.18em] text-[#180038] [clip-path:polygon(2%_0,100%_0,100%_82%,98%_100%,0_100%,0_18%)]">
        {answer || '_'}
      </div>

      <div className="mt-8 flex w-full max-w-[1040px] flex-col gap-3">
        {letters.map((row) => (
          <div
            className="flex flex-wrap justify-center gap-[12px]"
            key={row.join('')}
          >
            {row.map((letter) => (
              <button
                className={`min-h-[62px] rounded-md px-4 font-medium text-white transition focus:outline-none focus:ring-4 focus:ring-[#28e6b2]/50 ${
                  letter === 'BORRAR' || letter === 'LIMPIAR'
                    ? 'min-w-[104px] bg-[#ff205c] text-[17px] font-bold'
                    : letter === 'ESPACIO'
                      ? 'min-w-[128px] bg-[linear-gradient(180deg,#e000e9,#bd00d9)] text-[17px] font-bold'
                      : 'min-w-[74px] bg-[linear-gradient(180deg,#e000e9,#bd00d9)] text-[38px] hover:brightness-110'
                }`}
                disabled={disabled}
                key={letter}
                onClick={() => onKeyPress(letter)}
                type="button"
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>

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
