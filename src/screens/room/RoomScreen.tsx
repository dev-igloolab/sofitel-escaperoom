import type { GameState } from '../../shared/game'
import { ChallengeOneScreen } from './ChallengeOneScreen'
import { ChallengeThreeScreen } from './ChallengeThreeScreen'
import { ChallengeTwoScreen } from './ChallengeTwoScreen'
import { CountdownIntroScreen } from './CountdownIntroScreen'
import { MissionIntroScreen } from './MissionIntroScreen'
import { RankingScreen } from './RankingScreen'
import { WaitingRegistrationScreen } from './WaitingRegistrationScreen'

export function RoomScreen({ gameState }: { gameState: GameState }) {
  if (gameState.phase === 'waiting_registration') {
    return <WaitingRegistrationScreen />
  }

  if (gameState.phase === 'registered') {
    return <MissionIntroScreen />
  }

  if (gameState.phase === 'playing') {
    return <CountdownIntroScreen />
  }

  if (gameState.phase === 'challenge_2') {
    return <ChallengeTwoScreen />
  }

  if (gameState.phase === 'challenge_3') {
    return <ChallengeThreeScreen gameState={gameState} />
  }

  if (gameState.phase === 'ranking') {
    return <RankingScreen gameState={gameState} />
  }

  return <ChallengeOneScreen />
}
