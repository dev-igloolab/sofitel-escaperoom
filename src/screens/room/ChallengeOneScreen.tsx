import { socket } from '../../lib/socket'
import { CHALLENGE_DURATIONS_SECONDS } from '../../shared/game'
import { WordChallengeScreen, type WordAnswerResult } from './WordChallengeScreen'

const challengeAnswers: WordAnswerResult[] = [
  {
    aliases: ['123'],
    body: 'Correcto. El codigo fue registrado.',
    status: 'correct',
  },
]

export function ChallengeOneScreen() {
  return (
    <WordChallengeScreen
      answerMode="numeric"
      answers={challengeAnswers}
      briefBody={
        <>
          Revisen las cartas del reto y encuentren el codigo correcto.
          <br />
          Cuando tengan la respuesta, presionen Responder para registrarla.
        </>
      }
      briefTags={['2 minutos', 'Cartas', 'Registrar codigo']}
      challengeLabel="Reto 1:"
      durationSeconds={CHALLENGE_DURATIONS_SECONDS.challenge_1}
      fallbackIncorrectBody="Ese codigo no coincide. Revisen las cartas y vuelvan a intentarlo."
      levelUpBody="Primer codigo validado. Ya pueden avanzar al siguiente desafio."
      levelUpTitle="CODIGO VALIDADO"
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
