import type { ScreenRoute } from './game'

export function getScreenRoute(): ScreenRoute {
  const route = window.location.pathname.replace('/', '')

  if (route === 'room' || route === 'admin') {
    return route
  }

  return 'outside'
}
