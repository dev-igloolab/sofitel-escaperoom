import { socket } from '../../lib/socket'
import { CHALLENGE_DURATIONS_SECONDS } from '../../shared/game'
import { WordChallengeScreen, type WordAnswerResult } from './WordChallengeScreen'

const challengeAnswers: WordAnswerResult[] = [
  {
    aliases: ['abc'],
    body: 'Correcto. La palabra fue registrada.',
    status: 'correct',
  },
]

export function ChallengeOneScreen() {
  return (
    <WordChallengeScreen
      answers={challengeAnswers}
      briefBody={
        <>
          Revisen las cartas del reto y elijan la palabra correcta.
          <br />
          Cuando tengan la respuesta, presionen Responder para registrarla.
        </>
      }
      briefTags={['2 minutos', 'Cartas', 'Registrar palabra']}
      challengeLabel="Reto 1:"
      durationSeconds={CHALLENGE_DURATIONS_SECONDS.challenge_1}
      fallbackIncorrectBody="Esa palabra no coincide. Revisen las cartas y vuelvan a intentarlo."
      levelUpBody="Primera palabra validada. Ya pueden avanzar al siguiente desafio."
      levelUpTitle="PALABRA VALIDADA"
      nextActionLabel="COMENZAR RETO 2"
      onComplete={(secondsLeft) => {
        socket.emit('completeChallenge', {
          challengeId: 'challenge_1',
          secondsLeft,
        })
        socket.emit('startChallengeTwo')
      }}
      title="Cartas"
    />
  )
}
