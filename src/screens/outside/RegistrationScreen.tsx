import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { ActionButton } from '../../components/ActionButton'
import { TextInput } from '../../components/TextInput'
import { useStageScale } from '../../hooks/useStageScale'
import { socket } from '../../lib/socket'
import type { GroupRegistrationPayload, Participant } from '../../shared/game'
import { OutsideBranding } from './OutsideBranding'

const MAX_INPUT_LENGTH = 34
const MAX_PARTICIPANTS = 5
const keyboardRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['LIMPIAR', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ESPACIO', 'BORRAR'],
] as const

type ActiveField =
  | { type: 'group' }
  | { type: 'participant'; index: number }
  | null

const emptyParticipant: Participant = {
  name: '',
}

const panelClipPath =
  'polygon(9% 0,100% 0,100% 82%,91% 100%,0 100%,0 18%)'

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').slice(0, MAX_INPUT_LENGTH)
}

function sanitizeGroup(groupName: string, participants: Participant[]) {
  return {
    name: groupName.trim(),
    participants: participants.map((participant) => ({
      name: participant.name.trim(),
    })),
  }
}

function isGroupReady(group: GroupRegistrationPayload) {
  return (
    group.name.length > 0 &&
    group.participants.length > 0 &&
    group.participants.every((participant) => participant.name)
  )
}

export function RegistrationScreen() {
  const [activeField, setActiveField] = useState<ActiveField>(null)
  const [groupName, setGroupName] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([
    emptyParticipant,
  ])

  const group = useMemo(
    () => sanitizeGroup(groupName, participants),
    [groupName, participants],
  )
  const isReady = isGroupReady(group)

  function updateActiveField(updater: (current: string) => string) {
    if (!activeField) return

    if (activeField.type === 'group') {
      setGroupName((current) => normalizeText(updater(current)))
      return
    }

    setParticipants((currentParticipants) =>
      currentParticipants.map((participant, index) =>
        index === activeField.index
          ? {
              ...participant,
              name: normalizeText(updater(participant.name)),
            }
          : participant,
      ),
    )
  }

  function handleVirtualKey(key: string) {
    if (key === 'LIMPIAR') {
      updateActiveField(() => '')
      return
    }

    if (key === 'BORRAR') {
      updateActiveField((current) => current.slice(0, -1))
      return
    }

    if (key === 'ESPACIO') {
      updateActiveField((current) =>
        current.endsWith(' ') || !current ? current : `${current} `,
      )
      return
    }

    updateActiveField((current) => `${current}${key}`)
  }

  function addParticipant() {
    setParticipants((currentParticipants) => {
      if (currentParticipants.length >= MAX_PARTICIPANTS) {
        return currentParticipants
      }

      return [...currentParticipants, { ...emptyParticipant }]
    })
  }

  function removeParticipant(indexToRemove: number) {
    setParticipants((currentParticipants) => {
      if (currentParticipants.length === 1) return currentParticipants

      return currentParticipants.filter((_, index) => index !== indexToRemove)
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isReady) return

    socket.emit('register', group)
  }

  return (
    <form
      className="relative flex h-full w-full flex-col items-center justify-center px-[220px] pb-[150px] pt-[160px] text-center font-just"
      onSubmit={handleSubmit}
    >
      <OutsideBranding />

      <div className="flex w-full max-w-[1260px] flex-col items-center">
        <p className="text-[30px] font-extrabold uppercase leading-none tracking-[0.2em] text-white">
          Bienvenidos a:
        </p>
        <h1 className="mt-[34px] max-w-full whitespace-nowrap text-[66px] font-extrabold uppercase leading-none tracking-[0.01em] text-white">
          El desafío del <span className="text-[#b51c1f]">legado</span>
        </h1>
        <p className="mt-[34px] text-[28px] font-light uppercase leading-none tracking-[0.36em] text-white">
          Registro de grupo
        </p>

        <div className="mt-[40px] flex w-[790px] flex-col">
          <TextInput
            inputMode="none"
            placeholder="Nombre del grupo"
            readOnly
            value={groupName}
            onClick={() => setActiveField({ type: 'group' })}
            onFocus={() => setActiveField({ type: 'group' })}
          />
        </div>

        <div className="mt-[48px] grid w-full grid-cols-2 gap-x-[38px] gap-y-[34px]">
          {participants.map((participant, index) => (
            <ParticipantCard
              canRemove={participants.length > 1}
              index={index}
              key={index}
              participant={participant}
              onEdit={() => setActiveField({ type: 'participant', index })}
              onRemove={() => removeParticipant(index)}
            />
          ))}

          {participants.length < MAX_PARTICIPANTS && (
            <button
              className="group relative min-h-[104px] rounded-[8px] border border-[#c9a24a]/65 bg-[#441014]/48 px-8 text-[24px] font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-[#b51c1f]/28 focus:outline-none focus:ring-4 focus:ring-[#c9a24a]/35"
              onClick={addParticipant}
              type="button"
            >
              Agregar <span className="mx-2 text-[36px] leading-none">+</span>
              participantes
            </button>
          )}
        </div>

        <ActionButton className="mt-[42px] w-[520px]" disabled={!isReady} type="submit">
          Registrar grupo
        </ActionButton>
      </div>

      {activeField &&
        createPortal(
          <KeyboardPanel
            activeField={activeField}
            value={getFieldValue(activeField, groupName, participants)}
            onClose={() => setActiveField(null)}
            onKeyPress={handleVirtualKey}
          />,
          document.body,
        )}
    </form>
  )
}

function ParticipantCard({
  canRemove,
  index,
  onEdit,
  onRemove,
  participant,
}: {
  canRemove: boolean
  index: number
  onEdit: () => void
  onRemove: () => void
  participant: Participant
}) {
  return (
    <section className="relative rounded-[8px] border border-[#c9a24a]/65 bg-[#441014]/48 px-[26px] pb-[18px] pt-[24px] shadow-[0_16px_38px_rgba(0,0,0,0.24)]">
      <div className="absolute -top-[24px] left-[28px] flex items-center gap-4">
        <p className="text-[18px] font-extrabold uppercase leading-none tracking-[0.12em] text-white">
          Participante {index + 1}
        </p>
        <span className="h-px w-[86px] bg-white/50" />
      </div>

      {canRemove && (
        <button
          aria-label={`Eliminar participante ${index + 1}`}
          className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#b51c1f] text-[22px] font-extrabold leading-none text-white shadow-[0_8px_18px_rgba(0,0,0,0.4)] transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#c9a24a]/35"
          onClick={onRemove}
          type="button"
        >
          X
        </button>
      )}

      <div className="grid gap-[14px]">
        <TextInput
          inputMode="none"
          placeholder="Nombre"
          readOnly
          value={participant.name}
          variant="compact"
          onClick={onEdit}
          onFocus={onEdit}
        />
      </div>
    </section>
  )
}

function getFieldValue(
  activeField: ActiveField,
  groupName: string,
  participants: Participant[],
) {
  if (!activeField) return ''

  if (activeField.type === 'group') {
    return groupName
  }

  return participants[activeField.index]?.name ?? ''
}

function getFieldLabel(activeField: Exclude<ActiveField, null>) {
  if (activeField.type === 'group') {
    return 'Nombre del grupo'
  }

  return 'Nombre participante'
}

function getFieldPlaceholder(activeField: Exclude<ActiveField, null>) {
  if (activeField.type === 'group') {
    return 'Nombre del grupo'
  }

  return 'Nombre'
}

function KeyboardPanel({
  activeField,
  onClose,
  onKeyPress,
  value,
}: {
  activeField: Exclude<ActiveField, null>
  onClose: () => void
  onKeyPress: (key: string) => void
  value: string
}) {
  const scale = useStageScale()

  useEffect(() => {
    function handleKeyboardInput(event: KeyboardEvent) {
      if (event.key === 'Escape' || event.key === 'Enter') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'Backspace') {
        event.preventDefault()
        onKeyPress('BORRAR')
        return
      }

      if (event.key === ' ') {
        event.preventDefault()
        onKeyPress('ESPACIO')
        return
      }

      if (/^[a-zñ]$/i.test(event.key)) {
        event.preventDefault()
        onKeyPress(event.key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyboardInput)

    return () => window.removeEventListener('keydown', handleKeyboardInput)
  }, [onClose, onKeyPress])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-8 font-just text-white"
      style={{
        backgroundColor: 'rgba(4, 0, 14, 0.78)',
        backdropFilter: 'blur(1.5px)',
      }}
    >
      <button
        aria-label="Cerrar teclado"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />

      <div
        className="pointer-events-none relative flex h-[1080px] w-[1920px] shrink-0 origin-center items-center justify-center"
        style={{ transform: `scale(${scale})` }}
      >
        <section className="pointer-events-auto relative w-[1280px] pb-[62px]">
          <div className="relative">
            <svg
              className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon
                points="9,0 100,0 100,82 91,100 0,100 0,18"
                fill="none"
                stroke="#c9a24a"
                strokeOpacity="1"
                strokeWidth="1.85"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div
              className="relative h-[585px] overflow-hidden bg-[#b51c1f] text-center shadow-[0_22px_70px_rgba(0,0,0,0.46)]"
              style={{ clipPath: panelClipPath }}
            >
              <div className="flex h-full flex-col px-[106px] pb-[92px] pt-[70px]">
                <div className="flex w-fit items-center gap-5">
                  <span className="h-px w-[112px] bg-white/72" />
                  <p className="text-[24px] font-extrabold uppercase leading-none tracking-[0.02em] text-white">
                    {getFieldLabel(activeField)}
                  </p>
                  <span className="h-px w-[128px] bg-white/72" />
                </div>

                <div className="mx-auto mt-[40px] flex h-[86px] w-full max-w-[1010px] items-center justify-center overflow-hidden rounded-[12px] bg-white px-8 text-center text-[38px] font-light uppercase tracking-[0.36em] text-[#151515] shadow-[0_12px_28px_rgba(0,0,0,0.34)]">
                  {value || (
                    <span className="text-[#d5d5d8]">
                      {getFieldPlaceholder(activeField)}
                    </span>
                  )}
                </div>

                <div className="mt-[54px] flex flex-col gap-[13px]">
                  {keyboardRows.map((row) => (
                    <div
                      className="flex justify-center gap-[15px]"
                      key={row.join('')}
                    >
                      {row.map((key) => {
                        const isAction = key === 'LIMPIAR' || key === 'BORRAR'
                        const isSpace = key === 'ESPACIO'

                        return (
                          <button
                            className={`h-[73px] rounded-[8px] px-5 font-extrabold text-white shadow-[10px_10px_18px_rgba(86,0,0,0.32)] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#c9a24a]/40 ${
                              isAction
                                ? 'w-[184px] bg-[linear-gradient(180deg,#cf851f_0%,#c67c17_100%)] text-[22px]'
                                : isSpace
                                  ? 'w-[244px] bg-[linear-gradient(180deg,#bd171c_0%,#961217_100%)] text-[24px]'
                                  : 'w-[86px] bg-[linear-gradient(180deg,#c0171d_0%,#941116_100%)] text-[46px]'
                            }`}
                            key={key}
                            onClick={() => onKeyPress(key)}
                            type="button"
                          >
                            {key}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-[33px] left-1/2 z-30 -translate-x-1/2">
              <ActionButton
                className="w-[330px] scale-[0.94] !py-[15px] !text-[28px]"
                onClick={onClose}
                tone="white"
                type="button"
              >
                Listo
              </ActionButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
