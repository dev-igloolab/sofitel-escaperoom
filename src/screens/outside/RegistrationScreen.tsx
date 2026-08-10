import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { ActionButton } from '../../components/ActionButton'
import { TextInput } from '../../components/TextInput'
import { socket } from '../../lib/socket'
import type { GroupRegistrationPayload, Participant } from '../../shared/game'

const MAX_INPUT_LENGTH = 34
const MAX_PARTICIPANTS = 5
const keyboardRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['LIMPIAR', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ESPACIO', 'BORRAR'],
] as const

type ActiveField =
  | { type: 'group' }
  | { type: 'participant'; index: number; field: keyof Participant }
  | null

const emptyParticipant: Participant = {
  name: '',
  specialty: '',
}

const panelClipPath =
  'polygon(5% 0,100% 0,100% 82%,94% 100%,0 100%,0 18%)'
const STAGE_WIDTH = 1920
const STAGE_HEIGHT = 1080

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').slice(0, MAX_INPUT_LENGTH)
}

function sanitizeGroup(groupName: string, participants: Participant[]) {
  return {
    name: groupName.trim(),
    participants: participants.map((participant) => ({
      name: participant.name.trim(),
      specialty: participant.specialty.trim(),
    })),
  }
}

function isGroupReady(group: GroupRegistrationPayload) {
  return (
    group.name.length > 0 &&
    group.participants.length > 0 &&
    group.participants.every(
      (participant) => participant.name && participant.specialty,
    )
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
              [activeField.field]: normalizeText(
                updater(participant[activeField.field]),
              ),
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
      className="flex w-[1280px] translate-y-2 flex-col items-center text-center"
      onSubmit={handleSubmit}
    >
      <p className="text-[28px] font-bold uppercase leading-none tracking-[0.34em] text-white">
        Bienvenidos a:
      </p>
      <h1 className="mt-7 max-w-[1280px] whitespace-nowrap font-display text-[61px] uppercase leading-none tracking-[0.065em] text-[#28e6b2]">
        El código de la acción
      </h1>
      <p className="mt-7 text-[28px] font-light uppercase leading-none tracking-[0.42em] text-white">
        Registro de grupo
      </p>

      <div className="mt-7 flex w-[900px] flex-col">
        <TextInput
          inputMode="none"
          placeholder="Nombre del grupo"
          readOnly
          value={groupName}
          onClick={() => setActiveField({ type: 'group' })}
          onFocus={() => setActiveField({ type: 'group' })}
        />
      </div>

      <div className="mt-9 grid w-full grid-cols-2 gap-x-7 gap-y-10">
        {participants.map((participant, index) => (
          <ParticipantCard
            canRemove={participants.length > 1}
            index={index}
            key={index}
            participant={participant}
            onEdit={(field) =>
              setActiveField({ type: 'participant', index, field })
            }
            onRemove={() => removeParticipant(index)}
          />
        ))}

        {participants.length < MAX_PARTICIPANTS && (
          <button
            className="group relative min-h-[112px] rounded-[8px] border border-[#28e6b2]/35 bg-black/20 px-8 font-display text-[22px] uppercase tracking-[0.12em] text-[#28e6b2] transition hover:bg-[#28e6b2]/10 focus:outline-none focus:ring-4 focus:ring-[#28e6b2]/40"
            onClick={addParticipant}
            type="button"
          >
            Agregar
            <span className="mr-3 text-[34px] leading-none"> +</span>
            Participantes
          </button>
        )}
      </div>

      <ActionButton className="mt-7" disabled={!isReady} type="submit">
        Registrar grupo
      </ActionButton>

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
  onEdit: (field: keyof Participant) => void
  onRemove: () => void
  participant: Participant
}) {
  return (
    <section className="relative rounded-[8px] border border-[#28e6b2]/35 bg-black/25 px-5 pb-3.5 pt-4 shadow-[0_16px_38px_rgba(0,0,0,0.28)]">
      <div className="absolute -top-[23px] left-6 flex items-center gap-3">
        <p className="font-display text-[17px] uppercase leading-none tracking-[0.16em] text-[#28e6b2]">
          Participante {index + 1}
        </p>
        <span className="h-px w-[78px] bg-[#28e6b2]/35" />
      </div>

      {canRemove && (
        <button
          aria-label={`Eliminar participante ${index + 1}`}
          className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#ff205c] font-display text-[20px] leading-none text-white shadow-[0_8px_18px_rgba(0,0,0,0.4)] transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#ff205c]/35"
          onClick={onRemove}
          type="button"
        >
          X
        </button>
      )}

      <div className="grid gap-3">
        <TextInput
          inputMode="none"
          placeholder="Nombre"
          readOnly
          value={participant.name}
          variant="compact"
          onClick={() => onEdit('name')}
          onFocus={() => onEdit('name')}
        />
        <TextInput
          inputMode="none"
          placeholder="Especialidad"
          readOnly
          value={participant.specialty}
          variant="compact"
          onClick={() => onEdit('specialty')}
          onFocus={() => onEdit('specialty')}
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

  return participants[activeField.index]?.[activeField.field] ?? ''
}

function getFieldLabel(activeField: Exclude<ActiveField, null>) {
  if (activeField.type === 'group') {
    return 'Nombre del grupo'
  }

  return activeField.field === 'name' ? 'Nombre participante' : 'Especialidad'
}

function getFieldPlaceholder(activeField: Exclude<ActiveField, null>) {
  if (activeField.type === 'group') {
    return 'Grupo'
  }

  return activeField.field === 'name' ? 'Nombre' : 'Especialidad'
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
  const [scale, setScale] = useState(1)

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

  useEffect(() => {
    function updateScale() {
      setScale(
        Math.min(
          window.innerWidth / STAGE_WIDTH,
          window.innerHeight / STAGE_HEIGHT,
        ),
      )
    }

    updateScale()
    window.addEventListener('resize', updateScale)

    return () => window.removeEventListener('resize', updateScale)
  }, [])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-8 font-sans text-white"
      style={{
        backgroundColor: 'rgba(4, 0, 14, 0.9)',
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
        <section className="pointer-events-auto relative w-[1040px] pb-[82px]">
          <div className="relative">
            <svg
              className="pointer-events-none absolute -inset-x-[8px] -inset-y-[7px] z-20 h-[calc(100%+14px)] w-[calc(100%+16px)] overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon
                points="5,0 100,0 100,82 94,100 0,100 0,18"
                fill="none"
                stroke="#8e18ff"
                strokeOpacity="0.9"
                strokeWidth="0.82"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div
              className="relative h-[570px] overflow-hidden text-center shadow-[0_22px_70px_rgba(0,0,0,0.46)]"
              style={{
                background:
                  'radial-gradient(circle at 50% 44%, rgba(105,31,224,0.92) 0%, rgba(49,17,126,0.96) 40%, rgba(8,20,70,0.98) 100%)',
                clipPath: panelClipPath,
              }}
            >
              <div
                className="flex h-full flex-col"
                style={{ padding: '52px 62px 88px' }}
              >
                <div className="ml-[34px] flex w-fit items-center gap-5">
                  <span className="h-px w-[86px] bg-[#28e6b2]/60" />
                  <p className="font-display text-[23px] uppercase leading-none tracking-[0.17em] text-[#28e6b2] drop-shadow-[0_0_10px_rgba(40,230,178,0.4)]">
                    {getFieldLabel(activeField)}
                  </p>
                  <span className="h-px w-[86px] bg-[#28e6b2]/60" />
                </div>

                <div className="mx-auto mt-[34px] flex h-[76px] w-full max-w-[850px] items-center justify-center overflow-hidden rounded-[13px] bg-white px-8 text-center text-[31px] font-light uppercase tracking-[0.2em] text-slate-950 shadow-[0_12px_28px_rgba(0,0,0,0.42)]">
                  {value || (
                    <span className="text-[#c4c7cc]">
                      {getFieldPlaceholder(activeField)}
                    </span>
                  )}
                </div>

                <div className="mt-[46px] flex flex-col gap-3">
                  {keyboardRows.map((row) => (
                    <div
                      className="flex justify-center gap-3"
                      key={row.join('')}
                    >
                      {row.map((key) => {
                        const isAction = key === 'LIMPIAR' || key === 'BORRAR'
                        const isSpace = key === 'ESPACIO'

                        return (
                          <button
                            className={`min-h-[54px] rounded-md px-5 font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.28)] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#28e6b2]/50 ${
                              isAction
                                ? 'min-w-[128px] bg-[#ff205c] text-[19px]'
                                : isSpace
                                  ? 'min-w-[172px] bg-[#8e18ff] text-[19px]'
                                  : 'min-w-[58px] bg-[linear-gradient(180deg,#b92cff,#8318ee)] text-[30px]'
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

            <div className="absolute -bottom-[34px] left-1/2 z-30 -translate-x-1/2">
              <ActionButton
                className="w-[360px] scale-[0.82]"
                onClick={onClose}
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
