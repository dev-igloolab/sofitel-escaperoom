export type ScreenRoute = 'outside' | 'room' | 'admin'

export type GamePhase =
  | 'waiting_registration'
  | 'registered'
  | 'playing'
  | 'challenge_1'
  | 'challenge_2'
  | 'challenge_3'
  | 'ranking'

export type ChallengeId =
  | 'challenge_1'
  | 'challenge_2'
  | 'challenge_3'

export const CHALLENGE_IDS = [
  'challenge_1',
  'challenge_2',
  'challenge_3',
] as const satisfies ChallengeId[]

export const TOTAL_CHALLENGES = CHALLENGE_IDS.length

export const CHALLENGE_DURATIONS_SECONDS: Record<ChallengeId, number> = {
  challenge_1: 120,
  challenge_2: 120,
  challenge_3: 60,
}

export const TOTAL_MISSION_SECONDS = Object.values(
  CHALLENGE_DURATIONS_SECONDS,
).reduce((total, duration) => total + duration, 0)

export function isChallengePhase(phase: GamePhase): phase is ChallengeId {
  return CHALLENGE_IDS.includes(phase as ChallengeId)
}

export type ChallengeCompletionPayload = {
  challengeId: ChallengeId
  secondsLeft: number
}

export type Participant = {
  name: string
}

export type GroupRegistrationPayload = {
  name: string
  participants: Participant[]
}

export type RegisteredGroup = GroupRegistrationPayload & {
  points: number
  completedChallenges: ChallengeId[]
  savedAt?: string
}

export type RankingEntry = {
  groupName: string
  points: number
}

export type GameState = {
  phase: GamePhase
  group: RegisteredGroup | null
  savedGroups: RegisteredGroup[]
  rankings: RankingEntry[]
}

export type ClientToServerEvents = {
  register: (group: GroupRegistrationPayload) => void
  startGame: () => void
  startChallengeOne: () => void
  startChallengeTwo: () => void
  startChallengeThree: () => void
  completeChallenge: (payload: ChallengeCompletionPayload) => void
  showRanking: () => void
  closeSession: () => void
  setPhase: (phase: GamePhase) => void
  restartMission: () => void
  resetGame: () => void
}

export type ServerToClientEvents = {
  gameState: (state: GameState) => void
}

export const initialGameState: GameState = {
  phase: 'waiting_registration',
  group: null,
  savedGroups: [],
  rankings: [],
}
