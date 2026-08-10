import { ActionButton } from '../../components/ActionButton'
import { BrandLockup } from '../../components/BrandLockup'
import { FramePanel } from '../../components/FramePanel'
import { InfoBadge } from '../../components/InfoBadge'
import { TimerDisplay } from '../../components/TimerDisplay'
import { socket } from '../../lib/socket'
import { TOTAL_MISSION_SECONDS } from '../../shared/game'
import { formatClockTime } from '../../shared/time'

const totalMissionTime = formatClockTime(TOTAL_MISSION_SECONDS, {
  padMinutes: false,
})
const timerMissionTime = formatClockTime(TOTAL_MISSION_SECONDS)

export function CountdownIntroScreen() {
  return (
    <div className="relative h-full w-full">
      <BrandLockup className="absolute left-[200px] top-[75px] z-30" />

      <FramePanel
        className="absolute left-[108px] top-[130px] h-[770px] w-[1704px]"
        contentClassName="flex h-full min-w-0 flex-col items-center px-[112px] pb-[142px] pt-[92px] text-center"
      >
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <h1 className="max-w-full whitespace-nowrap font-display text-[64px] uppercase leading-none tracking-[0.065em] text-[#28e6b2]">
            LA CUENTA REGRESIVA COMENZÓ
          </h1>

          <div className="mt-[34px] max-w-[1320px] text-[31px] font-medium leading-[1.32] text-white">
            <p>
              Ricardo llegó hoy a consulta. Su placa sigue intacta.
              <br />
              Todavía existe una oportunidad para actuar antes del evento.
            </p>
            <p className="mt-[24px]">
              Durante los próximos <strong>cinco minutos</strong>, deberán interpretar la evidencia, descubrir las
              <br />
              pistas ocultas y tomar las
              decisiones correctas ANTES de que ocurra el evento.
            </p>
            <p className="mt-[24px]">
              <strong>El riesgo de Ricardo es mayor de lo que parece.</strong>
              <br />
              Cada <strong>acierto</strong> desbloquea el <strong>siguiente</strong> nivel. Cada <strong>decisión</strong> acerca
              <br />a Ricardo a un futuro diferente.
            </p>
          </div>

          <div className="mt-[48px] flex w-full min-w-0 max-w-[1430px] items-start justify-center gap-[54px]">
            <InfoBadge className="w-[292px]" labelClassName="text-[22px]" side="left">
              {`${totalMissionTime} MINUTOS`}
            </InfoBadge>
            <ActionButton
              className="w-[750px] min-w-0 px-[62px] text-[38px] tracking-[0.1em]"
              onClick={() => socket.emit('startChallengeOne')}
              tone="yellow"
            >
              INICIAR EXPERIENCIA
            </ActionButton>
            <InfoBadge className="w-[292px]" labelClassName="text-[22px]" side="right">
              EQUIPO LISTO
            </InfoBadge>
          </div>
        </div>
      </FramePanel>

      <TimerDisplay
        className="absolute bottom-[111px] left-1/2 z-30 -translate-x-1/2 scale-[1.08]"
        time={timerMissionTime}
        label="MINUTOS"
      />
    </div>
  )
}
