type FormatClockTimeOptions = {
  padMinutes?: boolean
}

export function formatClockTime(
  seconds: number,
  { padMinutes = true }: FormatClockTimeOptions = {},
) {
  const minutes = Math.floor(seconds / 60).toString()
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')

  return `${padMinutes ? minutes.padStart(2, '0') : minutes}:${remainingSeconds}`
}
