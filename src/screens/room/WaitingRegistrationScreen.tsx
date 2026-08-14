import { OutsideBranding } from '../outside/OutsideBranding'

export function WaitingRegistrationScreen() {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center px-[120px] text-center font-just">
      <OutsideBranding />

      <p className="text-[31px] font-extrabold uppercase leading-none tracking-[0.16em] text-white">
        ¡Gracias por participar!
      </p>
      <h1 className="mt-[30px] max-w-[1220px] whitespace-nowrap text-[72px] font-extrabold uppercase leading-none text-white">
        Pueden salir <span className="text-[#b51c1f]">de la sala</span>
      </h1>
    </section>
  )
}
