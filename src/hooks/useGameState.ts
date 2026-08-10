import { useEffect, useState } from 'react'
import { socket } from '../lib/socket'
import { initialGameState, type GameState } from '../shared/game'

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)

  useEffect(() => {
    socket.on('gameState', setGameState)
    socket.connect()

    return () => {
      socket.off('gameState', setGameState)
    }
  }, [])

  return gameState
}
