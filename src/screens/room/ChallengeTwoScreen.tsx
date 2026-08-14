import { socket } from '../../lib/socket'
import { CHALLENGE_DURATIONS_SECONDS } from '../../shared/game'
import {
  WordChallengeScreen,
  type ChallengeIntroStep,
  type WordAnswerResult,
} from './WordChallengeScreen'

const challengeAnswers: WordAnswerResult[] = [
  {
    aliases: ['calidad que trasciende'],
    body: 'Correcto. La palabra fue registrada.',
    status: 'correct',
  },
]

const introSteps: ChallengeIntroStep[] = [
  {
    body: (
      <>
        El propósito
        <br />
        está fragmentado...
        <br />y el tiempo corre.
      </>
    ),
  },
  {
    body: (
      <>
        Solo si logran
        <br />
        <span className="text-[#b51c1f] underline decoration-[#b51c1f] decoration-[4px] underline-offset-[9px]">
          unir correctamente
        </span>
        <br />
        las tres C, nuestra misión
        <br />
        tomará forma...
      </>
    ),
  },
  {
    body: (
      <>
        Y la <span className="text-[#b51c1f]">palabra clave</span>
        <br />
        se revelará para
        <br />
        que puedan avanzar.
      </>
    ),
  },
]

export function ChallengeTwoScreen() {
  return (
    <WordChallengeScreen
      answers={challengeAnswers}
      answerPrompt="Registren la palabra del"
      briefBody={
        <>
          Armen el rompecabezas del reto y descubran la palabra.
          <br />
          Cuando tengan la respuesta, presionen Responder para registrarla.
        </>
      }
      briefTags={['1 minuto', 'Rompecabezas', 'Registrar palabra']}
      challengeLabel="Reto 2:"
      durationSeconds={CHALLENGE_DURATIONS_SECONDS.challenge_2}
      fallbackIncorrectBody="Esa palabra no coincide. Vuelvan a intentarlo."
      introSteps={introSteps}
      levelUpBody="Segunda palabra validada. Ya pueden avanzar al último reto."
      levelUpTitle="PALABRA VALIDADA"
      nextActionLabel="CONTINUAR"
      onComplete={(secondsLeft) => {
        socket.emit('completeChallenge', {
          challengeId: 'challenge_2',
          secondsLeft,
        })
        socket.emit('startChallengeThree')
      }}
      showLevelUp={false}
      title="Rompecabezas"
    />
  )
}
