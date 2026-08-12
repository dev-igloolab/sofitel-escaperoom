import { OutsideBranding } from '../outside/OutsideBranding'

export function WaitingRegistrationScreen() {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center px-[120px] text-center font-just">
      <OutsideBranding />

      <p className="text-[31px] font-extrabold uppercase leading-none tracking-[0.16em] text-white">
        ¡Gracias por jugar!
      </p>
      <h1 className="mt-[30px] max-w-[1220px] whitespace-nowrap text-[72px] font-extrabold uppercase leading-none text-white">
        Pueden salir <span className="text-[#b51c1f]">de la sala</span>
      </h1>
      <div className="mt-[32px] flex items-center justify-center gap-5">
        <span className="h-px w-[120px] bg-white/55" />
        <p className="max-w-[980px] text-[22px] font-extrabold uppercase leading-[1.2] tracking-[0.02em] text-white">
          Pueden retirarse de la sala. Gracias por participar.
        </p>
        <span className="h-px w-[120px] bg-white/55" />
      </div>
    </section>
  )
}
