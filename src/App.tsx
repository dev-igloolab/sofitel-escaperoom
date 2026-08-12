import { useState } from 'react'
import { useGameState } from './hooks/useGameState'
import { AppLayout } from './layouts/AppLayout'
import { AdminScreen } from './screens/admin'
import { OutsideScreen } from './screens/outside'
import { RoomScreen } from './screens/room'
import { getScreenRoute } from './shared/routes'

function App() {
  const gameState = useGameState()
  const [route] = useState(getScreenRoute)

  return (
    <AppLayout showFooter={false}>
      {route === 'outside' && <OutsideScreen gameState={gameState} />}
      {route === 'room' && <RoomScreen gameState={gameState} />}
      {route === 'admin' && <AdminScreen gameState={gameState} />}
    </AppLayout>
  )
}

export default App
