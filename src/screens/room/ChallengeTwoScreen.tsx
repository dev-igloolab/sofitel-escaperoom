import { socket } from '../../lib/socket'
import { CHALLENGE_DURATIONS_SECONDS } from '../../shared/game'
import { WordChallengeScreen, type WordAnswerResult } from './WordChallengeScreen'

const challengeAnswers: WordAnswerResult[] = [
  {
    aliases: ['def'],
    body: 'Correcto. La palabra fue registrada.',
    status: 'correct',
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
      briefTags={['2 minutos', 'Rompecabezas', 'Registrar palabra']}
      challengeLabel="Reto 2:"
      durationSeconds={CHALLENGE_DURATIONS_SECONDS.challenge_2}
      fallbackIncorrectBody="Esa palabra no coincide. Vuelvan a intentarlo."
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
