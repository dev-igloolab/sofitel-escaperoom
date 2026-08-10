import { ActionButton } from '../../components/ActionButton'
import { BrandLockup } from '../../components/BrandLockup'
import { FramePanel } from '../../components/FramePanel'
import { socket } from '../../lib/socket'
import type { GameState, RankingEntry } from '../../shared/game'

function formatPoints(points: number) {
  return `${points} ${points === 1 ? 'punto' : 'puntos'}`
}

function getVisibleRankings(gameState: GameState) {
  const currentGroupEntry = gameState.group
    ? {
        groupName: gameState.group.name,
        points: gameState.group.points,
      }
    : null

  const rankings = currentGroupEntry
    ? [
        ...gameState.rankings.filter(
          (entry) => entry.groupName !== currentGroupEntry.groupName,
        ),
        currentGroupEntry,
      ]
    : gameState.rankings

  return rankings
    .slice()
    .sort(
      (firstEntry, secondEntry) =>
        secondEntry.points - firstEntry.points ||
        firstEntry.groupName.localeCompare(secondEntry.groupName),
    )
    .slice(0, 4)
}

function getRankingSlots(rankings: RankingEntry[]) {
  return Array.from({ length: 4 }, (_, index) => rankings[index] ?? null)
}

export function RankingScreen({ gameState }: { gameState: GameState }) {
  const rankings = getVisibleRankings(gameState)
  const rankingSlots = getRankingSlots(rankings)

  return (
    <div className="relative h-full w-full">
      <BrandLockup className="absolute left-[168px] top-[48px] z-40" />

      <FramePanel
        className="absolute left-[94px] top-[112px] h-[862px] w-[1736px]"
        contentClassName="relative h-full px-[245px] pb-[150px] pt-[60px]"
      >
        <div className="flex h-full flex-col items-center">
          <h1 className="font-display text-[58px] uppercase leading-none tracking-[0.14em] text-[#28e6b2]">
            RANKING
          </h1>

          <div className="mt-[40px] flex w-[1225px] max-w-full flex-col gap-[38px]">
            {rankingSlots.map((entry, index) =>
              entry ? (
                <RankingRow
                  entry={entry}
                  index={index}
                  key={`${entry.groupName}-${index}`}
                />
              ) : (
                <EmptyRankingRow key={`empty-ranking-${index}`} />
              ),
            )}
          </div>
        </div>
      </FramePanel>

      <ActionButton
        className="!absolute left-1/2 top-[930px] z-50 min-w-[252px] -translate-x-1/2 px-[42px] py-[16px] text-[26px]"
        onClick={() => socket.emit('closeSession')}
        type="button"
      >
        REGRESAR
      </ActionButton>
    </div>
  )
}

function EmptyRankingRow() {
  return (
    <div className="relative h-[116px] w-full drop-shadow-[0_10px_24px_rgba(11,0,35,0.5)]">
      <div
        className="absolute right-0 top-0 h-full w-[358px] bg-[#ff1461]"
        style={{
          clipPath: 'polygon(0 0,100% 0,100% 74%,93.4% 100%,0 100%)',
        }}
      />

      <div
        className="absolute left-0 top-0 h-full w-[calc(100%-302px)] bg-white"
        style={{
          clipPath:
            'polygon(2.4% 0,100% 0,100% 72%,94% 100%,0 100%,0 18%)',
        }}
      />
    </div>
  )
}

function RankingRow({
  entry,
  index,
}: {
  entry: RankingEntry
  index: number
}) {
  const groupName = entry.groupName.trim() || `Grupo ${index + 1}`

  return (
    <div className="relative h-[116px] w-full drop-shadow-[0_10px_24px_rgba(11,0,35,0.5)]">
      <div
        className="absolute right-0 top-0 z-10 h-full w-[358px] bg-[#ff1461]"
        style={{
          clipPath: 'polygon(0 0,100% 0,100% 74%,93.4% 100%,0 100%)',
        }}
      />

      <div
        className="absolute left-0 top-0 z-20 flex h-full w-[calc(100%-302px)] min-w-0 items-center justify-center bg-white px-[54px] font-sans text-[52px] font-normal text-[#38313f]"
        style={{
          clipPath:
            'polygon(2.4% 0,100% 0,100% 72%,94% 100%,0 100%,0 18%)',
        }}
      >
        <span className="max-w-full truncate">{groupName}</span>
      </div>

      <div className="absolute right-0 top-0 z-30 flex h-full w-[300px] items-center justify-center whitespace-nowrap pr-[34px] font-sans text-[42px] font-bold text-white">
        {formatPoints(entry.points)}
      </div>
    </div>
  )
}
