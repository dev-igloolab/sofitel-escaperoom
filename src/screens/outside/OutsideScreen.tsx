import type { GameState } from '../../shared/game'
import { CompletedRegistrationScreen } from './CompletedRegistrationScreen'
import { GameInProgressScreen } from './GameInProgressScreen'
import { RegistrationScreen } from './RegistrationScreen'

export function OutsideScreen({ gameState }: { gameState: GameState }) {
  if (gameState.phase === 'waiting_registration') {
    return <RegistrationScreen />
  }

  if (gameState.phase === 'registered') {
    return <CompletedRegistrationScreen />
  }

  return <GameInProgressScreen />
}
