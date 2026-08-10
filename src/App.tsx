import { useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { AppLayout } from './layouts/AppLayout'
import { AdminScreen } from './screens/admin'
import { OutsideScreen } from './screens/outside'
import { RoomScreen } from './screens/room'
import { isChallengePhase } from './shared/game'
import { getScreenRoute } from './shared/routes'

function App() {
  const gameState = useGameState()
  const [route] = useState(getScreenRoute)
  const usesRoomArtwork =
    route === 'room' &&
    (gameState.phase === 'registered' ||
      gameState.phase === 'playing' ||
      isChallengePhase(gameState.phase) ||
      gameState.phase === 'ranking')

  return (
    <AppLayout
      background={usesRoomArtwork ? 'framed' : 'plain'}
      showFooter={route === 'outside'}
    >
      {route === 'outside' && <OutsideScreen gameState={gameState} />}
      {route === 'room' && <RoomScreen gameState={gameState} />}
      {route === 'admin' && <AdminScreen gameState={gameState} />}
    </AppLayout>
  )
}

export default App
