import express from 'express'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { Server } from 'socket.io'
import { createServer as createViteServer } from 'vite'
import {
  CHALLENGE_DURATIONS_SECONDS,
  type ChallengeId,
  initialGameState,
  type ClientToServerEvents,
  type GamePhase,
  type GameState,
  type RankingEntry,
  type RegisteredGroup,
  type ServerToClientEvents,
} from '../src/shared/game.ts'

const port = Number(process.env.PORT ?? 5173)
const isProduction = process.env.NODE_ENV === 'production'
const dataDirectory = process.env.DATA_DIR ?? 'data'
const groupsPath = path.resolve(dataDirectory, 'groups.json')

let gameState: GameState = initialGameState

const app = express()
const httpServer = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer)

const completedChallengeBasePoints = 20

type GroupsBackup = {
  exportedAt: string
  groups: RegisteredGroup[]
}

function emitGameState() {
  io.emit('gameState', gameState)
}

function getRankingsFromGroups(groups: RegisteredGroup[]): RankingEntry[] {
  return groups
    .map((group) => ({
      groupName: group.name,
      points: group.points,
    }))
    .sort(
      (firstEntry, secondEntry) =>
        secondEntry.points - firstEntry.points ||
        firstEntry.groupName.localeCompare(secondEntry.groupName),
    )
}

function getUpdatedGroups() {
  if (!gameState.group) return gameState.savedGroups

  const savedGroup: RegisteredGroup = {
    ...gameState.group,
    savedAt: new Date().toISOString(),
  }

  return [
    ...gameState.savedGroups.filter(
      (group) => group.name !== gameState.group?.name,
    ),
    savedGroup,
  ].sort(
    (firstEntry, secondEntry) =>
      secondEntry.points - firstEntry.points ||
      firstEntry.name.localeCompare(secondEntry.name),
  )
}

function getFallbackSavedAt(exportedAt: string, index: number) {
  const exportedDate = new Date(exportedAt)
  const baseDate = Number.isFinite(exportedDate.getTime())
    ? exportedDate
    : new Date()

  return new Date(baseDate.getTime() - index * 10 * 60 * 1000).toISOString()
}

function normalizeGroupsBackup(value: unknown): RegisteredGroup[] {
  const exportedAt =
    value &&
    typeof value === 'object' &&
    'exportedAt' in value &&
    typeof (value as { exportedAt: unknown }).exportedAt === 'string'
      ? (value as { exportedAt: string }).exportedAt
      : new Date().toISOString()
  const rawGroups =
    value && typeof value === 'object' && 'groups' in value
      ? (value as { groups: unknown }).groups
      : []

  if (!Array.isArray(rawGroups)) return []

  return rawGroups
    .map((entry, index): RegisteredGroup | null => {
      if (!entry || typeof entry !== 'object') return null

      const maybeGroup = entry as Partial<RegisteredGroup>
      const name =
        typeof maybeGroup.name === 'string' ? maybeGroup.name.trim() : ''
      const participants = Array.isArray(maybeGroup.participants)
        ? maybeGroup.participants
            .map((participant) => {
              if (!participant || typeof participant !== 'object') return null

              const maybeParticipant = participant as {
                name?: unknown
              }
              const participantName =
                typeof maybeParticipant.name === 'string'
                  ? maybeParticipant.name.trim()
                  : ''

              if (!participantName) return null

              return {
                name: participantName.slice(0, 120),
              }
            })
            .filter((participant): participant is RegisteredGroup['participants'][number] =>
              Boolean(participant),
            )
        : []
      const points =
        typeof maybeGroup.points === 'number' && Number.isFinite(maybeGroup.points)
          ? Math.max(0, Math.floor(maybeGroup.points))
          : null
      const completedChallenges = Array.isArray(maybeGroup.completedChallenges)
        ? maybeGroup.completedChallenges.filter(
            (challengeId): challengeId is ChallengeId =>
              typeof challengeId === 'string' &&
              challengeId in CHALLENGE_DURATIONS_SECONDS,
          )
        : []
      const savedAt =
        typeof maybeGroup.savedAt === 'string' &&
        Number.isFinite(Date.parse(maybeGroup.savedAt))
          ? maybeGroup.savedAt
          : getFallbackSavedAt(exportedAt, index)

      if (!name || points === null) return null

      return {
        name: name.slice(0, 120),
        participants,
        points,
        completedChallenges: [...new Set(completedChallenges)],
        savedAt,
      }
    })
    .filter((group): group is RegisteredGroup => Boolean(group))
    .sort(
      (firstGroup, secondGroup) =>
        secondGroup.points - firstGroup.points ||
        firstGroup.name.localeCompare(secondGroup.name),
    )
}

async function saveGroups(groups = gameState.savedGroups) {
  const backup: GroupsBackup = {
    exportedAt: new Date().toISOString(),
    groups,
  }

  await mkdir(path.dirname(groupsPath), { recursive: true })
  await writeFile(groupsPath, JSON.stringify(backup, null, 2), 'utf8')
}

async function loadGroups() {
  try {
    const contents = await readFile(groupsPath, 'utf8')
    const parsedBackup = JSON.parse(contents)
    const savedGroups = normalizeGroupsBackup(parsedBackup)

    gameState = {
      ...gameState,
      savedGroups,
      rankings: getRankingsFromGroups(savedGroups),
    }

    if (
      parsedBackup &&
      typeof parsedBackup === 'object' &&
      'groups' in parsedBackup &&
      Array.isArray((parsedBackup as { groups: unknown }).groups) &&
      (parsedBackup as { groups: unknown[] }).groups.some(
        (group) =>
          !group ||
          typeof group !== 'object' ||
          !('savedAt' in group),
      )
    ) {
      await saveGroups(savedGroups)
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn('Could not load groups database:', error)
    }
  }
}

const adminAssignablePhases = new Set<GamePhase>([
  'registered',
  'challenge_1',
  'challenge_2',
  'challenge_3',
  'ranking',
])

await loadGroups()

app.use(express.json({ limit: '1mb' }))

app.get('/api/rankings/export', (_request, response) => {
  response.setHeader(
    'Content-Disposition',
    `attachment; filename="cardio-groups-${new Date().toISOString().slice(0, 10)}.json"`,
  )
  response.json({
    exportedAt: new Date().toISOString(),
    groups: gameState.savedGroups,
  } satisfies GroupsBackup)
})

app.post('/api/rankings/import', async (request, response) => {
  const savedGroups = normalizeGroupsBackup(request.body)
  const rankings = getRankingsFromGroups(savedGroups)

  gameState = {
    ...gameState,
    savedGroups,
    rankings,
  }

  await saveGroups(savedGroups)
  emitGameState()

  response.json({
    imported: savedGroups.length,
    groups: savedGroups,
    rankings,
  })
})

app.post('/api/rankings/reset', async (_request, response) => {
  gameState = {
    ...gameState,
    savedGroups: [],
    rankings: [],
  }

  await saveGroups([])
  emitGameState()

  response.json({
    reset: true,
  })
})

io.on('connection', (socket) => {
  socket.emit('gameState', gameState)

  socket.on('register', (group) => {
    const participants = group.participants
      .slice(0, 5)
      .map((participant) => ({
        name: participant.name.trim(),
      }))
      .filter((participant) => participant.name)

    if (!group.name.trim() || participants.length === 0) return

    gameState = {
      ...gameState,
      phase: 'registered',
      group: {
        name: group.name.trim(),
        participants,
        points: 0,
        completedChallenges: [],
      },
    }

    emitGameState()
  })

  socket.on('startGame', () => {
    if (!gameState.group) return

    gameState = {
      ...gameState,
      phase: 'challenge_1',
    }

    emitGameState()
  })

  socket.on('startChallengeOne', () => {
    if (!gameState.group) return

    gameState = {
      ...gameState,
      phase: 'challenge_1',
    }

    emitGameState()
  })

  socket.on('startChallengeTwo', () => {
    if (!gameState.group) return

    gameState = {
      ...gameState,
      phase: 'challenge_2',
    }

    emitGameState()
  })

  socket.on('startChallengeThree', () => {
    if (!gameState.group) return

    gameState = {
      ...gameState,
      phase: 'challenge_3',
    }

    emitGameState()
  })

  socket.on('completeChallenge', ({ challengeId, secondsLeft }) => {
    if (!gameState.group || !(challengeId in CHALLENGE_DURATIONS_SECONDS)) return

    const completedChallenges = gameState.group.completedChallenges ?? []

    if (completedChallenges.includes(challengeId)) return

    const remainingSeconds = Math.max(
      0,
      Math.min(Math.floor(secondsLeft), CHALLENGE_DURATIONS_SECONDS[challengeId]),
    )
    const earnedPoints = completedChallengeBasePoints + remainingSeconds

    gameState = {
      ...gameState,
      group: {
        ...gameState.group,
        points: gameState.group.points + earnedPoints,
        completedChallenges: [...completedChallenges, challengeId],
      },
    }

    emitGameState()
  })

  socket.on('restartMission', () => {
    if (!gameState.group) return

    gameState = {
      ...gameState,
      phase: 'registered',
    }

    emitGameState()
  })

  socket.on('showRanking', async () => {
    if (!gameState.group) return

    const savedGroups = getUpdatedGroups()
    const rankings = getRankingsFromGroups(savedGroups)

    gameState = {
      ...gameState,
      phase: 'ranking',
      savedGroups,
      rankings,
    }

    await saveGroups(savedGroups)
    emitGameState()
  })

  socket.on('closeSession', () => {
    gameState = {
      ...gameState,
      phase: 'waiting_registration',
      group: null,
    }

    emitGameState()
  })

  socket.on('setPhase', async (phase) => {
    if (!adminAssignablePhases.has(phase) || !gameState.group) return

    const updatedGroups =
      phase === 'ranking' ? getUpdatedGroups() : gameState.savedGroups

    gameState = {
      ...gameState,
      phase,
      ...(phase === 'ranking'
        ? {
            savedGroups: updatedGroups,
            rankings: getRankingsFromGroups(updatedGroups),
          }
        : {}),
    }

    if (phase === 'ranking') {
      await saveGroups(updatedGroups)
    }

    emitGameState()
  })

  socket.on('resetGame', () => {
    gameState = {
      ...initialGameState,
      savedGroups: gameState.savedGroups,
      rankings: gameState.rankings,
    }
    emitGameState()
  })
})

if (isProduction) {
  app.use(express.static('dist'))
  app.get(/.*/, (_request, response) => {
    response.sendFile('index.html', { root: 'dist' })
  })
} else {
  const vite = await createViteServer({
    appType: 'spa',
    server: {
      middlewareMode: true,
    },
  })

  app.use(vite.middlewares)
}

httpServer.listen(port, () => {
  console.log(`Escape room app running on http://localhost:${port}`)
})
