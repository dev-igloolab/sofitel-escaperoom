import {
  Activity,
  BarChart3,
  ChevronDown,
  Database,
  Download,
  RotateCcw,
  Send,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { socket } from '../../lib/socket'
import {
  CHALLENGE_IDS,
  TOTAL_CHALLENGES,
  type ChallengeId,
  type GamePhase,
  type GameState,
  type Participant,
  type RegisteredGroup,
} from '../../shared/game'

type AdminTab = 'flow' | 'data' | 'report'

const phaseLabels: Record<GamePhase, string> = {
  waiting_registration: 'Esperando registro',
  registered: 'Grupo registrado',
  playing: 'Juego en curso',
  challenge_1: 'Reto 1 en curso',
  challenge_2: 'Reto 2 en curso',
  challenge_3: 'Reto 3 en curso',
  ranking: 'Ranking',
}

const testablePhases: GamePhase[] = [
  'registered',
  'playing',
  ...CHALLENGE_IDS,
  'ranking',
]

const challengeLabels: Record<ChallengeId, string> = {
  challenge_1: 'Reto 1',
  challenge_2: 'Reto 2',
  challenge_3: 'Reto 3',
}

function getInitialAdminTab(): AdminTab {
  if (window.location.hash === '#report') return 'report'

  return window.location.hash === '#data' ? 'data' : 'flow'
}

function formatSavedAt(savedAt?: string) {
  if (!savedAt) return 'Sin fecha'

  const date = new Date(savedAt)

  if (!Number.isFinite(date.getTime())) return 'Sin fecha'

  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatReportWorksheet(
  XLSX: typeof import('xlsx-js-style'),
  worksheet: import('xlsx-js-style').WorkSheet,
  {
    border,
    centeredColumns,
    columnCount,
    columns,
    titleEndColumn,
  }: {
    border: Record<string, { color: { rgb: string }; style: string }>
    centeredColumns: number[]
    columnCount: number
    columns: Array<{ wch: number }>
    titleEndColumn: number
  },
) {
  const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1:A1')

  worksheet['!cols'] = columns
  worksheet['!merges'] = [
    { e: { c: titleEndColumn, r: 0 }, s: { c: 0, r: 0 } },
    { e: { c: titleEndColumn, r: 1 }, s: { c: 0, r: 1 } },
  ]
  worksheet['!rows'] = [{ hpt: 23 }, { hpt: 18 }, { hpt: 24 }]
  worksheet['!autofilter'] = {
    ref: `${XLSX.utils.encode_cell({ c: 0, r: 2 })}:${XLSX.utils.encode_cell({
      c: columnCount - 1,
      r: 2,
    })}`,
  }

  if (worksheet.A1) {
    worksheet.A1.s = {
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: 'F2F2F2' }, patternType: 'solid' },
      font: { bold: true, color: { rgb: '222222' }, sz: 16 },
    }
  }

  if (worksheet.A2) {
    worksheet.A2.s = {
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: 'F8F8F8' }, patternType: 'solid' },
      font: { color: { rgb: '666666' }, italic: true },
    }
  }

  for (let col = 0; col < columnCount; col += 1) {
    const headerCell = worksheet[XLSX.utils.encode_cell({ c: col, r: 2 })]

    if (headerCell) {
      headerCell.s = {
        alignment: { horizontal: 'center', vertical: 'center' },
        border,
        fill: { fgColor: { rgb: 'EAEAEA' }, patternType: 'solid' },
        font: { bold: true, color: { rgb: '222222' } },
      }
    }
  }

  for (let row = 3; row <= range.e.r; row += 1) {
    for (let col = 0; col < columnCount; col += 1) {
      const cell = worksheet[XLSX.utils.encode_cell({ c: col, r: row })]

      if (cell) {
        cell.s = {
          alignment: {
            horizontal: centeredColumns.includes(col) ? 'center' : 'left',
            vertical: 'top',
            wrapText: true,
          },
          border,
          fill: {
            fgColor: { rgb: row % 2 === 0 ? 'FFFFFF' : 'FAFAFA' },
            patternType: 'solid',
          },
          font: { bold: col === 0 },
        }
      }
    }
  }
}

export function AdminScreen({ gameState }: { gameState: GameState }) {
  const importInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<AdminTab>(getInitialAdminTab)
  const [selectedPhase, setSelectedPhase] = useState<GamePhase>(
    gameState.phase === 'waiting_registration' ? 'registered' : gameState.phase,
  )
  const [databaseStatus, setDatabaseStatus] = useState('')
  const [selectedGroupName, setSelectedGroupName] = useState('')
  const hasRegisteredGroup = Boolean(gameState.group)
  const participants = gameState.group?.participants ?? []
  const selectedGroup =
    gameState.savedGroups.find((group) => group.name === selectedGroupName) ??
    gameState.savedGroups[0] ??
    null

  function selectTab(tab: AdminTab) {
    setActiveTab(tab)
    window.history.replaceState(null, '', `#${tab}`)
  }

  async function exportRankings() {
    setDatabaseStatus('')

    const response = await fetch('/api/rankings/export')

    if (!response.ok) {
      setDatabaseStatus('No se pudo exportar la base de datos.')
      return
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `cardio-groups-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setDatabaseStatus('Base de datos exportada.')
  }

  async function exportGroupsReport() {
    setDatabaseStatus('')

    const XLSX = await import('xlsx-js-style')
    const summaryHeaders = [
      'Nombre del grupo',
      'Cantidad de personas',
      'Puntaje',
      'Retos completados',
      'Fecha de guardado',
    ]
    const participantHeaders = [
      'Nombre del grupo',
      'Participante',
      'Especialidad',
    ]
    const summaryRows = gameState.savedGroups.map((group) => [
      group.name,
      group.participants.length,
      group.points,
      `${group.completedChallenges.length}/${TOTAL_CHALLENGES}`,
      formatSavedAt(group.savedAt),
    ])
    const participantRows = gameState.savedGroups.flatMap((group) =>
      group.participants.map((participant) => [
        group.name,
        participant.name,
        participant.specialty,
      ]),
    )
    const summaryWorksheet = XLSX.utils.aoa_to_sheet([
      ['Reporte de grupos'],
      [`Generado: ${new Date().toLocaleDateString('es-CO')}`],
      summaryHeaders,
      ...summaryRows,
    ])
    const participantWorksheet = XLSX.utils.aoa_to_sheet([
      ['Detalle de participantes'],
      [`Generado: ${new Date().toLocaleDateString('es-CO')}`],
      participantHeaders,
      ...participantRows,
    ])
    const workbook = XLSX.utils.book_new()
    const border = {
      bottom: { color: { rgb: 'D9D9D9' }, style: 'thin' },
      left: { color: { rgb: 'D9D9D9' }, style: 'thin' },
      right: { color: { rgb: 'D9D9D9' }, style: 'thin' },
      top: { color: { rgb: 'D9D9D9' }, style: 'thin' },
    }

    formatReportWorksheet(XLSX, summaryWorksheet, {
      centeredColumns: [1, 2, 3, 4],
      columnCount: 5,
      columns: [
        { wch: 30 },
        { wch: 20 },
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
      ],
      titleEndColumn: 4,
      border,
    })
    formatReportWorksheet(XLSX, participantWorksheet, {
      centeredColumns: [],
      columnCount: 3,
      columns: [{ wch: 30 }, { wch: 34 }, { wch: 34 }],
      titleEndColumn: 2,
      border,
    })

    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen')
    XLSX.utils.book_append_sheet(workbook, participantWorksheet, 'Participantes')

    const workbookBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([workbookBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `cardio-reporte-grupos-${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
    setDatabaseStatus('Reporte exportado.')
  }

  async function importRankings(file: File) {
    setDatabaseStatus('')

    try {
      const contents = await file.text()
      const parsedBackup = JSON.parse(contents)
      const response = await fetch('/api/rankings/import', {
        body: JSON.stringify(parsedBackup),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        setDatabaseStatus('No se pudo importar la base de datos.')
        return
      }

      const result = (await response.json()) as { imported: number }
      setDatabaseStatus(
        `Base de datos importada: ${result.imported} grupo${result.imported === 1 ? '' : 's'}.`,
      )
    } catch {
      setDatabaseStatus('El archivo no es un JSON valido.')
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = ''
      }
    }
  }

  async function resetDatabase() {
    setDatabaseStatus('')

    const response = await fetch('/api/rankings/reset', {
      method: 'POST',
    })

    if (!response.ok) {
      setDatabaseStatus('No se pudo reiniciar la base de datos.')
      return
    }

    setSelectedGroupName('')
    setDatabaseStatus('Base de datos reiniciada.')
  }

  return (
    <section className="w-full max-w-[1180px] rounded-[8px] border border-violet-300/20 bg-[#130426]/96 p-8 text-white shadow-2xl shadow-violet-950/50">
      <header className="flex items-start justify-between gap-8 border-b border-violet-300/15 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#28e6b2]">
            Admin
          </p>
          <h1 className="mt-3 text-[34px] font-bold leading-none">
            Control de la experiencia
          </h1>
          <p className="mt-3 max-w-[680px] text-sm leading-relaxed text-violet-100/68">
            Opera la sesion actual y administra el historial persistente de
            grupos.
          </p>
        </div>

        <div className="min-w-[230px] rounded-[8px] border border-[#28e6b2]/25 bg-[#28e6b2]/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#28e6b2]">
            Fase actual
          </p>
          <p className="mt-2 text-xl font-bold">{phaseLabels[gameState.phase]}</p>
          <p className="mt-2 inline-flex rounded bg-black/25 px-2 py-1 font-mono text-xs text-violet-100/70">
            {gameState.phase}
          </p>
        </div>
      </header>

      <div className="mt-5 flex border-b border-violet-300/15">
        <TabButton
          active={activeTab === 'flow'}
          icon={Activity}
          label="Flujo"
          onClick={() => selectTab('flow')}
        />
        <TabButton
          active={activeTab === 'data'}
          icon={Database}
          label="Base de datos"
          onClick={() => selectTab('data')}
        />
        <TabButton
          active={activeTab === 'report'}
          icon={BarChart3}
          label="Reporte"
          onClick={() => selectTab('report')}
        />
      </div>

      {activeTab === 'flow' && (
        <FlowTab
          gameState={gameState}
          hasRegisteredGroup={hasRegisteredGroup}
          participants={participants}
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
        />
      )}

      {activeTab === 'data' && (
        <DataTab
          databaseStatus={databaseStatus}
          exportGroupsReport={exportGroupsReport}
          exportRankings={exportRankings}
          gameState={gameState}
          importInputRef={importInputRef}
          importRankings={importRankings}
          resetDatabase={resetDatabase}
          selectedGroup={selectedGroup}
          setSelectedGroupName={setSelectedGroupName}
        />
      )}

      {activeTab === 'report' && (
        <ReportTab
          exportGroupsReport={exportGroupsReport}
          groups={gameState.savedGroups}
        />
      )}
    </section>
  )
}

function FlowTab({
  gameState,
  hasRegisteredGroup,
  participants,
  selectedPhase,
  setSelectedPhase,
}: {
  gameState: GameState
  hasRegisteredGroup: boolean
  participants: Participant[]
  selectedPhase: GamePhase
  setSelectedPhase: (phase: GamePhase) => void
}) {
  return (
    <div className="pt-6">
      <div className="grid grid-cols-2 gap-8 border-b border-violet-300/15 pb-6">
        <div className="border-r border-violet-300/12 pr-8">
          <Metric
            detail={gameState.group?.name ?? 'Sin registro'}
            icon={Users}
            label="Grupo activo"
            value={gameState.group?.name ?? 'Sin grupo'}
          />
        </div>
        <Metric
          detail={formatParticipants(participants)}
          icon={Activity}
          label="Participantes"
          value={`${participants.length} participante${participants.length === 1 ? '' : 's'}`}
        />
      </div>

      <div className="mt-6 grid grid-cols-[0.9fr_1.35fr] gap-9">
        <div>
          <SectionHeader
            description="Limpia el grupo activo y vuelve la experiencia al registro."
            icon={RotateCcw}
            title="Sesion"
          />
          <div className="mt-5">
            <AdminButton
              icon={RotateCcw}
              label="Reiniciar experiencia"
              onClick={() => socket.emit('resetGame')}
              tone="primary"
            />
          </div>
        </div>

        <div className="border-l border-violet-300/12 pl-9">
          <SectionHeader
            description="Mueve el grupo registrado a una fase para pruebas o soporte."
            icon={Send}
            title="Flujo"
          />
          <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
            <select
              className="min-h-12 rounded-[8px] border border-violet-300/20 bg-[#09011c] px-4 text-sm font-semibold text-white outline-none transition focus:border-[#28e6b2] focus:ring-4 focus:ring-[#28e6b2]/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!hasRegisteredGroup}
              onChange={(event) =>
                setSelectedPhase(event.target.value as GamePhase)
              }
              value={selectedPhase}
            >
              {testablePhases.map((phase) => (
                <option key={phase} value={phase}>
                  {phaseLabels[phase]}
                </option>
              ))}
            </select>
            <AdminButton
              disabled={!hasRegisteredGroup}
              icon={Send}
              label="Enviar"
              onClick={() => socket.emit('setPhase', selectedPhase)}
              tone="danger"
            />
          </div>

          {!hasRegisteredGroup && (
            <p className="mt-3 text-xs text-violet-100/55">
              Registra un grupo para activar este control.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function DataTab({
  databaseStatus,
  exportGroupsReport,
  exportRankings,
  gameState,
  importInputRef,
  importRankings,
  resetDatabase,
  selectedGroup,
  setSelectedGroupName,
}: {
  databaseStatus: string
  exportGroupsReport: () => void
  exportRankings: () => void
  gameState: GameState
  importInputRef: React.RefObject<HTMLInputElement | null>
  importRankings: (file: File) => Promise<void>
  resetDatabase: () => Promise<void>
  selectedGroup: RegisteredGroup | null
  setSelectedGroupName: (groupName: string) => void
}) {
  const groupCount = gameState.savedGroups.length

  return (
    <div className="pt-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#28e6b2]/12 text-[#28e6b2]">
            <Database className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-base font-bold">Base de datos</h2>
            <p className="mt-1 text-sm text-violet-100/62">
              {groupCount} grupo{groupCount === 1 ? '' : 's'} guardado
              {groupCount === 1 ? '' : 's'} con participantes, puntos y retos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <AdminButton
            disabled={groupCount === 0}
            icon={Download}
            label="Exportar reporte"
            onClick={exportGroupsReport}
            tone="primary"
          />
          <AdminButton
            icon={Download}
            label="Exportar DB"
            onClick={exportRankings}
            tone="secondary"
          />
          <AdminButton
            icon={Upload}
            label="Importar DB"
            onClick={() => importInputRef.current?.click()}
            tone="secondary"
          />
          <input
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]

              if (file) {
                void importRankings(file)
              }
            }}
            ref={importInputRef}
            type="file"
          />
          <AdminButton
            icon={RotateCcw}
            label="Reiniciar DB"
            onClick={resetDatabase}
            tone="danger"
          />
        </div>
      </div>

      {databaseStatus && (
        <p className="mt-4 rounded-[8px] border border-[#28e6b2]/20 bg-[#28e6b2]/10 px-3 py-2 text-xs font-semibold text-[#28e6b2]">
          {databaseStatus}
        </p>
      )}

      <div className="mt-6 border-t border-violet-300/15 pt-5">
        {groupCount > 0 ? (
          <div className="grid grid-cols-[1.2fr_0.8fr] gap-5">
            <GroupsTable
              groups={gameState.savedGroups}
              onSelect={setSelectedGroupName}
              selectedGroupName={selectedGroup?.name ?? ''}
            />
            <GroupDetail group={selectedGroup} />
          </div>
        ) : (
          <div className="border border-violet-300/16 px-4 py-5 text-sm text-violet-100/62">
            Todavia no hay grupos guardados en la base de datos.
          </div>
        )}
      </div>
    </div>
  )
}

function ReportTab({
  exportGroupsReport,
  groups,
}: {
  exportGroupsReport: () => void
  groups: RegisteredGroup[]
}) {
  const totalParticipants = groups.reduce(
    (total, group) => total + group.participants.length,
    0,
  )
  const specialtyCount = new Set(
    groups.flatMap((group) =>
      group.participants
        .map((participant) => participant.specialty.trim())
        .filter(Boolean),
    ),
  ).size

  return (
    <div className="pt-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#28e6b2]/12 text-[#28e6b2]">
            <BarChart3 className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-base font-bold">Reporte</h2>
            <p className="mt-1 text-sm text-violet-100/62">
              Resumen visual de grupos, personas y especialidades.
            </p>
          </div>
        </div>

        <AdminButton
          disabled={groups.length === 0}
          icon={Download}
          label="Exportar Excel"
          onClick={exportGroupsReport}
          tone="primary"
        />
      </div>

      <div className="mt-6 border-t border-violet-300/15 pt-5">
        {groups.length > 0 ? (
          <VisualReport
            groups={groups}
            specialtyCount={specialtyCount}
            totalParticipants={totalParticipants}
          />
        ) : (
          <div className="border border-violet-300/16 px-4 py-5 text-sm text-violet-100/62">
            Todavía no hay grupos guardados para generar el reporte.
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={`relative inline-flex min-h-12 items-center gap-2 px-5 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-[#28e6b2]/25 ${
        active ? 'text-[#28e6b2]' : 'text-violet-100/58 hover:text-white'
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" strokeWidth={2.3} />
      {label}
      {active && (
        <span className="absolute inset-x-4 bottom-[-1px] h-[2px] bg-[#28e6b2]" />
      )}
    </button>
  )
}

function Metric({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="pb-1">
      <div className="flex items-center gap-3 text-violet-100/58">
        <Icon className="h-5 w-5 text-[#28e6b2]" strokeWidth={2.2} />
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-3 truncate text-xl font-bold">{value}</p>
      <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-violet-100/58">
        {detail}
      </p>
    </div>
  )
}

function SectionHeader({
  children,
  description,
  icon: Icon,
  title,
}: {
  children?: ReactNode
  description: string
  icon: LucideIcon
  title: string
}) {
  return (
    <section>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#28e6b2]/12 text-[#28e6b2]">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-violet-100/62">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  )
}

function formatParticipants(participants: Participant[]) {
  if (participants.length === 0) {
    return 'Sin participantes'
  }

  return participants
    .map(
      (participant, index) =>
        `${index + 1}. ${participant.name} - ${participant.specialty}`,
    )
    .join('\n')
}

function VisualReport({
  groups,
  specialtyCount,
  totalParticipants,
}: {
  groups: RegisteredGroup[]
  specialtyCount: number
  totalParticipants: number
}) {
  const [expandedGroupName, setExpandedGroupName] = useState(groups[0]?.name ?? '')

  return (
    <section>
      <div className="grid grid-cols-3 gap-4 border-y border-violet-300/15 py-4">
        <ReportStat label="Grupos" value={groups.length} />
        <ReportStat label="Personas" value={totalParticipants} />
        <ReportStat label="Especialidades" value={specialtyCount} />
      </div>

      <div className="mt-5 overflow-hidden border border-violet-300/16">
        {groups.map((group) => {
          const isExpanded = group.name === expandedGroupName

          return (
            <div className="border-b border-violet-300/10 last:border-b-0" key={group.name}>
              <button
                className="grid w-full grid-cols-[1fr_104px_104px_104px_132px_42px] items-center gap-3 px-4 py-4 text-left text-sm transition hover:bg-violet-400/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#28e6b2]/45"
                onClick={() =>
                  setExpandedGroupName(isExpanded ? '' : group.name)
                }
                type="button"
              >
                <span className="min-w-0">
                  <span className="block truncate text-base font-bold text-white">
                    {group.name}
                  </span>
                  <span className="mt-1 block text-xs text-violet-100/55">
                    {group.participants.length} participante
                    {group.participants.length === 1 ? '' : 's'} registrado
                    {group.participants.length === 1 ? '' : 's'}
                  </span>
                </span>
                <ReportPill label="Personas" value={group.participants.length} />
                <ReportPill label="Puntos" value={group.points} />
                <ReportPill
                  label="Retos"
                  value={`${group.completedChallenges.length}/${TOTAL_CHALLENGES}`}
                />
                <ReportPill label="Guardado" value={formatSavedAt(group.savedAt)} />
                <ChevronDown
                  className={`h-5 w-5 justify-self-end text-violet-100/60 transition ${
                    isExpanded ? 'rotate-180 text-[#28e6b2]' : ''
                  }`}
                  strokeWidth={2.2}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-violet-300/10 bg-black/10 px-4 py-4">
                  <div className="grid grid-cols-[1fr_1fr] gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-violet-100/55">
                        Participantes
                      </p>
                      <div className="mt-3 overflow-hidden border border-violet-300/12">
                        {group.participants.length > 0 ? (
                          group.participants.map((participant, index) => (
                            <div
                              className="grid grid-cols-[36px_1fr_1fr] gap-3 border-b border-violet-300/8 px-3 py-2 text-sm last:border-b-0"
                              key={`${participant.name}-${index}`}
                            >
                              <span className="font-mono text-xs text-violet-100/45">
                                {index + 1}
                              </span>
                              <span className="truncate font-bold text-white">
                                {participant.name}
                              </span>
                              <span className="truncate text-violet-100/70">
                                {participant.specialty}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="px-3 py-3 text-sm text-violet-100/55">
                            Sin participantes registrados.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-violet-100/55">
                        Retos completados
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {CHALLENGE_IDS.map(
                          (challengeId) => {
                            const isComplete =
                              group.completedChallenges.includes(challengeId)

                            return (
                              <span
                                className={`rounded px-2 py-1 text-xs font-bold ${
                                  isComplete
                                    ? 'bg-[#28e6b2]/14 text-[#28e6b2]'
                                    : 'bg-violet-400/10 text-violet-100/40'
                                }`}
                                key={challengeId}
                              >
                                {challengeLabels[challengeId]}
                              </span>
                            )
                          },
                        )}
                      </div>
                    </div>
                  </div>


                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ReportPill({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="text-center">
      <span className="block text-[11px] font-bold uppercase tracking-wide text-violet-100/45">
        {label}
      </span>
      <span className="mt-1 block text-base font-bold text-[#28e6b2]">
        {value}
      </span>
    </span>
  )
}

function ReportStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-violet-100/55">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function GroupsTable({
  groups,
  onSelect,
  selectedGroupName,
}: {
  groups: RegisteredGroup[]
  onSelect: (groupName: string) => void
  selectedGroupName: string
}) {
  return (
    <div className="overflow-hidden border border-violet-300/16">
      <div className="grid grid-cols-[1fr_88px_86px] border-b border-violet-300/12 px-4 py-3 text-xs font-bold uppercase tracking-wide text-violet-100/55">
        <span>Grupo</span>
        <span className="text-right">Puntos</span>
        <span className="text-right">Retos</span>
      </div>
      <div className="max-h-[260px] overflow-y-auto">
        {groups.map((group) => {
          const isSelected = group.name === selectedGroupName

          return (
            <button
              className={`grid w-full grid-cols-[1fr_88px_86px] items-center border-b border-violet-300/8 px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-violet-400/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#28e6b2]/45 ${
                isSelected ? 'bg-[#28e6b2]/12' : 'bg-transparent'
              }`}
              key={group.name}
              onClick={() => onSelect(group.name)}
              type="button"
            >
              <span className="min-w-0">
                <span className="block truncate font-bold text-white">
                  {group.name}
                </span>
                <span className="mt-1 block text-xs text-violet-100/55">
                  {group.participants.length} participante
                  {group.participants.length === 1 ? '' : 's'}
                </span>
              </span>
              <span className="text-right font-bold text-[#28e6b2]">
                {group.points}
              </span>
              <span className="text-right text-violet-100/70">
                {group.completedChallenges.length}/{TOTAL_CHALLENGES}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function GroupDetail({ group }: { group: RegisteredGroup | null }) {
  if (!group) return null

  return (
    <div className="border border-violet-300/16 p-4">
      <div className="flex items-start justify-between gap-4 border-b border-violet-300/12 pb-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-100/55">
            Detalle del grupo
          </p>
          <h3 className="mt-2 truncate text-xl font-bold">{group.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wide text-[#28e6b2]">
            Puntos
          </p>
          <p className="text-2xl font-bold">{group.points}</p>
        </div>
      </div>

      <div className="mt-4 border-b border-violet-300/12 pb-4">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-100/55">
          Retos completados
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CHALLENGE_IDS.map(
            (challengeId) => {
              const isComplete = group.completedChallenges.includes(challengeId)

              return (
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    isComplete
                      ? 'bg-[#28e6b2]/14 text-[#28e6b2]'
                      : 'bg-violet-400/10 text-violet-100/40'
                  }`}
                  key={challengeId}
                >
                  {challengeLabels[challengeId]}
                </span>
              )
            },
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-100/55">
          Participantes
        </p>
        <div className="mt-2">
          {group.participants.length > 0 ? (
            group.participants.map((participant, index) => (
              <div
                className="grid grid-cols-[34px_1fr] gap-2 border-b border-violet-300/10 py-2 text-sm last:border-b-0"
                key={`${participant.name}-${index}`}
              >
                <span className="font-mono text-xs text-violet-100/45">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {participant.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-violet-100/55">
                    {participant.specialty}
                  </span>
                </span>
              </div>
            ))
          ) : (
            <p className="py-3 text-sm text-violet-100/55">
              Sin participantes registrados.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function AdminButton({
  disabled = false,
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  disabled?: boolean
  icon: LucideIcon
  label: string
  onClick: () => void
  tone: 'primary' | 'secondary' | 'danger'
}) {
  const toneClass = {
    danger:
      'bg-[#ff0a5b] text-white hover:bg-[#ff3c7b] focus:ring-[#ff0a5b]/35',
    primary:
      'bg-[#28e6b2] text-[#130028] hover:bg-[#5ff5ce] focus:ring-[#28e6b2]/35',
    secondary:
      'border border-violet-300/30 bg-violet-400/10 text-white hover:bg-violet-400/20 focus:ring-violet-400/30',
  }[tone]

  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] px-4 text-sm font-bold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" strokeWidth={2.4} />
      {label}
    </button>
  )
}
