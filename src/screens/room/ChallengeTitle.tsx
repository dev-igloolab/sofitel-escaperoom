type ChallengeTitleProps = {
  challengeLabel: string
  title: string
  className?: string
  labelClassName?: string
  titleClassName?: string
}

export function ChallengeTitle({
  challengeLabel,
  className = 'w-[700px] rounded-[16px] border-[4px]',
  labelClassName = 'w-[190px] rounded-r-[16px] text-[34px]',
  title,
  titleClassName = 'text-[36px]',
}: ChallengeTitleProps) {
  return (
    <div
      className={`flex h-[76px] items-center overflow-hidden border-[#d31cff] bg-[#8d00ef]/38 shadow-[0_0_22px_rgba(197,28,255,0.3)] backdrop-blur-[0.5px] ${className}`}
    >
      <span
        className={`flex h-full items-center justify-center bg-[#fff200] font-display uppercase tracking-[0.04em] text-[#21003f] ${labelClassName}`}
      >
        {challengeLabel}
      </span>
      <span
        className={`flex h-full flex-1 items-center justify-center bg-[linear-gradient(90deg,rgba(139,0,232,0.36),rgba(168,24,242,0.3))] px-[28px] font-bold uppercase leading-none text-white ${titleClassName}`}
      >
        {title}
      </span>
    </div>
  )
}
