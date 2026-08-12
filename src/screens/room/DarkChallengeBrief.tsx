import type { ReactNode } from 'react'
import { ActionButton } from '../../components/ActionButton'

export function DarkChallengeBrief({
  actionLabel,
  body,
  challengeLabel,
  formattedTime,
  onAction,
  tags,
  title,
}: {
  actionLabel: string
  body: ReactNode
  challengeLabel: string
  formattedTime: string
  onAction: () => void
  tags: string[]
  title: string
}) {
  return (
    <section className="absolute inset-0 z-10 flex h-full w-full flex-col items-center font-just text-white">
      <div className="absolute right-[150px] top-[82px] rounded-[8px] border border-white/55 bg-black/32 px-[20px] py-[10px]">
        <p className="text-[48px] font-extrabold leading-none">{formattedTime}</p>
      </div>

      <div className="mt-[142px] flex items-center gap-[22px] text-[25px] font-extrabold uppercase tracking-[0.18em] text-[#c9a24a]">
        <span className="h-px w-[92px] bg-[#c9a24a]/75" />
        <span>{challengeLabel}</span>
        <span className="h-px w-[92px] bg-[#c9a24a]/75" />
      </div>

      <h1 className="mt-[18px] max-w-[1320px] text-center text-[68px] font-extrabold uppercase leading-none text-white">
        {title}
      </h1>

      <div className="mt-[70px] flex w-full max-w-[1370px] justify-center gap-[22px]">
        {tags.map((tag) => (
          <div
            className="flex h-[92px] min-w-0 flex-1 items-center justify-center border border-[#c9a24a]/70 bg-[#741519]/58 px-[24px] text-center text-[24px] font-extrabold uppercase leading-tight shadow-[0_12px_32px_rgba(0,0,0,0.2)] [clip-path:polygon(3%_0,100%_0,100%_78%,97%_100%,0_100%,0_22%)]"
            key={tag}
          >
            {tag}
          </div>
        ))}
      </div>

      <div className="mt-[78px] max-w-[1260px] text-center text-[39px] font-bold leading-[1.3] text-white">
        {body}
      </div>

      <div className="absolute bottom-[118px] left-1/2 -translate-x-1/2">
        <ActionButton className="w-[500px]" onClick={onAction}>
          {actionLabel}
        </ActionButton>
      </div>

      <img
        alt="Laboratorios Legrand"
        className="absolute bottom-[42px] left-1/2 h-auto w-[210px] -translate-x-1/2"
        src="/images/laboratorio.webp"
      />
    </section>
  )
}
