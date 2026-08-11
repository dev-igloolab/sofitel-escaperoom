import { OutsideBranding } from './OutsideBranding'

export function GameInProgressScreen() {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center px-[120px] text-center font-just">
      <OutsideBranding />

      <p className="text-[31px] font-bold uppercase leading-none tracking-[0.16em] text-white">
        ¡Misión en curso!
      </p>
      <h1 className="mt-[30px] max-w-[1120px] whitespace-nowrap text-[72px] font-bold uppercase leading-none text-white">
        Registro <span className="text-[#b51c1f]">en pausa</span>
      </h1>
      <div className="mt-[32px] flex items-center justify-center gap-5">
        <span className="h-px w-[120px] bg-white/55" />
        <p className="max-w-[780px] text-[22px] font-bold uppercase leading-[1.18] tracking-[0.02em] text-white">
          Esperen a que el grupo actual termine la misión para poder realizar un nuevo registro
        </p>
        <span className="h-px w-[120px] bg-white/55" />
      </div>
    </section>
  )
}
