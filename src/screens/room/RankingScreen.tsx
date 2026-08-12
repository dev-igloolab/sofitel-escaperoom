import { ActionButton } from '../../components/ActionButton'
import { socket } from '../../lib/socket'
import type { GameState, RankingEntry } from '../../shared/game'
import { OutsideBranding } from '../outside/OutsideBranding'

type VisibleRankingEntry = RankingEntry & {
  rank: number
}

function formatPoints(points: number) {
  return `${points} ${points === 1 ? 'punto' : 'puntos'}`
}

function getVisibleRankings(gameState: GameState) {
  const currentGroupName = gameState.group?.name.trim()
  const currentGroupEntry = gameState.group
    ? {
        groupName: currentGroupName || gameState.group.name,
        points: gameState.group.points,
      }
    : null

  const rankings = currentGroupEntry
    ? [
        ...gameState.rankings.filter(
          (entry) => entry.groupName.trim() !== currentGroupEntry.groupName,
        ),
        currentGroupEntry,
      ]
    : gameState.rankings

  const sortedRankings = rankings
    .slice()
    .sort(
      (firstEntry, secondEntry) =>
        secondEntry.points - firstEntry.points ||
        firstEntry.groupName.localeCompare(secondEntry.groupName),
    )

  const rankedEntries = sortedRankings.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))
  const topEntries = rankedEntries.slice(0, 3)
  const currentEntry = currentGroupName
    ? rankedEntries.find((entry) => entry.groupName.trim() === currentGroupName)
    : null

  if (currentEntry && currentEntry.rank > 3) {
    return [...topEntries, currentEntry]
  }

  return rankedEntries.slice(0, 4)
}

function getRankingSlots(rankings: VisibleRankingEntry[]) {
  return Array.from({ length: 4 }, (_, index) => rankings[index] ?? null)
}

export function RankingScreen({ gameState }: { gameState: GameState }) {
  const rankings = getVisibleRankings(gameState)
  const rankingSlots = getRankingSlots(rankings)
  const currentGroupName = gameState.group?.name.trim()

  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center px-[120px] pb-[118px] pt-[138px] text-center font-just">
      <OutsideBranding />

      <p className="text-[31px] font-extrabold uppercase leading-none tracking-[0.16em] text-white">
        ¡Misión completada!
      </p>
      <h1 className="mt-[28px] max-w-[1120px] whitespace-nowrap text-[72px] font-extrabold uppercase leading-none text-white">
        Ranking <span className="text-[#b51c1f]">de equipos</span>
      </h1>

      <div className="mt-[54px] flex w-full max-w-[1220px] flex-col gap-[22px]">
        {rankingSlots.map((entry, index) =>
          entry ? (
            <RankingRow
              entry={entry}
              index={index}
              isCurrentGroup={entry.groupName === currentGroupName}
              key={`${entry.groupName}-${index}`}
            />
          ) : (
            <EmptyRankingRow key={`empty-ranking-${index}`} index={index} />
          ),
        )}
      </div>

      <ActionButton
        className="mt-[54px] w-[390px]"
        onClick={() => socket.emit('closeSession')}
        type="button"
      >
        TERMINAR
      </ActionButton>
    </section>
  )
}

function EmptyRankingRow({ index }: { index: number }) {
  return (
    <div className="relative flex h-[96px] items-center overflow-hidden rounded-[8px] border border-[#c9a24a]/55 bg-[#441014]/46 px-[28px] opacity-60 shadow-[0_16px_38px_rgba(0,0,0,0.22)]">
      <span className="w-[96px] text-left text-[50px] font-extrabold leading-none text-[#b51c1f]">
        {index + 1}
      </span>
      <span className="flex-1" />
      <span className="w-[240px]" />
    </div>
  )
}

function RankingRow({
  entry,
  index,
  isCurrentGroup,
}: {
  entry: VisibleRankingEntry
  index: number
  isCurrentGroup: boolean
}) {
  const groupName = entry.groupName.trim() || `Grupo ${index + 1}`
  const visibleRank = entry.rank

  return (
    <div
      className={`relative flex h-[104px] items-center overflow-hidden rounded-[8px] px-[28px] shadow-[0_18px_42px_rgba(0,0,0,0.28)] ${
        isCurrentGroup
          ? 'border-2 border-[#c9a24a] bg-[#b51c1f]/82'
          : 'border border-[#c9a24a]/65 bg-[#441014]/58'
      }`}
    >
      <span
        className={`w-[96px] text-left text-[56px] font-extrabold leading-none ${
          isCurrentGroup ? 'text-white' : 'text-[#b51c1f]'
        }`}
      >
        {visibleRank}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-[18px]">
        <span className="min-w-0 truncate text-left text-[36px] font-extrabold uppercase tracking-[0.08em] text-white">
          {groupName}
        </span>
        {isCurrentGroup && (
          <span className="shrink-0 rounded-[4px] bg-white px-[14px] py-[7px] text-[15px] font-extrabold uppercase tracking-[0.08em] text-[#b51c1f]">
            Su equipo
          </span>
        )}
      </span>
      <span
        className={`ml-[28px] flex h-[58px] min-w-[250px] items-center justify-center rounded-[6px] px-[28px] text-[26px] font-extrabold uppercase tracking-[0.04em] ${
          isCurrentGroup
            ? 'bg-white text-[#b51c1f]'
            : 'bg-[#b51c1f] text-white'
        }`}
      >
        {formatPoints(entry.points)}
      </span>
    </div>
  )
}
