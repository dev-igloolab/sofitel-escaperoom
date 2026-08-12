import { socket } from '../../lib/socket'
import { CHALLENGE_DURATIONS_SECONDS } from '../../shared/game'
import {
  WordChallengeScreen,
  type ChallengeIntroStep,
  type WordAnswerResult,
} from './WordChallengeScreen'

const challengeAnswers: WordAnswerResult[] = [
  {
    aliases: ['123'],
    body: 'Correcto. El código fue registrado.',
    status: 'correct',
  },
]

const introSteps: ChallengeIntroStep[] = [
  {
    body: (
      <>
        Han cruzado el umbral
        <br />y ahora deben descubrir
        <br />
        la esencia del código
      </>
    ),
  },
  {
    body: (
      <>
        Solo quienes logren
        <br />
        interpretar las señales
        <br />
        correctas podrán avanzar.
      </>
    ),
  },
  {
    body: (
      <>
        Confíen en su criterio,
        <br />
        en su experiencia,
        <br />
        en su creatividad y,
        <br />
        sobre todo,{' '}
        <span className="text-[#b51c1f]">en su equipo...</span>
      </>
    ),
  },
  {
    body: (
      <>
        ¡Porque el tiempo
        <br />
        ya está corriendo!
        <br />
        <img
          alt=""
          className="mx-auto mt-[42px] h-[150px] w-[150px] object-contain"
          src="/images/reloj.webp"
        />
      </>
    ),
    showTimer: true,
  },
  {
    body: (
      <>
        Utilicen los frascos para
        <br />
        identificar el aroma que
        <br />
        guarda nuestros valores.
        <br />
        <span className="text-[#b51c1f]">¡Encuéntrenla!</span>
      </>
    ),
    showTimer: true,
    stepNumber: '1',
  },
  {
    body: (
      <>
        El aroma de los valores
        <br />y la <span className="text-[#b51c1f]">luz UV</span> revelará lo
        <br />
        que permanece oculto a
        <br />
        simple vista.
      </>
    ),
    showTimer: true,
    stepNumber: '2',
  },
  {
    body: (
      <>
        Bajo la luz de nuestra
        <br />
        esencia, descubra
        <br />
        <span className="text-[#b51c1f]">el código</span> para pasar
        <br />
        al siguiente nivel.
      </>
    ),
    showTimer: true,
    stepNumber: '3',
  },
]

export function ChallengeOneScreen() {
  return (
    <WordChallengeScreen
      answerMode="numeric"
      answers={challengeAnswers}
      briefBody={
        <>
          Revisen las cartas del reto y encuentren el código correcto.
          <br />
          Cuando tengan la respuesta, presionen Responder para registrarla.
        </>
      }
      briefTags={['2 minutos', 'Cartas', 'Registrar código']}
      challengeLabel="Reto 1:"
      durationSeconds={CHALLENGE_DURATIONS_SECONDS.challenge_1}
      fallbackIncorrectBody="Ese código no coincide. Vuelvan a intentarlo."
      introSteps={introSteps}
      levelUpBody="Primer código validado. Ya pueden avanzar al siguiente desafío."
      levelUpTitle="CÓDIGO VALIDADO"
      nextActionLabel="CONTINUAR"
      onComplete={(secondsLeft) => {
        socket.emit('completeChallenge', {
          challengeId: 'challenge_1',
          secondsLeft,
        })
        socket.emit('startChallengeTwo')
      }}
      showLevelUp={false}
      title="Cartas"
    />
  )
}
