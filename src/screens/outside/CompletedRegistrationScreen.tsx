import { OutsideBranding } from './OutsideBranding'

export function CompletedRegistrationScreen() {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center px-[120px] text-center font-just">
      <OutsideBranding />

      <p className="text-[31px] font-extrabold uppercase leading-none tracking-[0.16em] text-white">
        ¡Registro exitoso!
      </p>
      <h1 className="mt-[30px] max-w-[1120px] whitespace-nowrap text-[72px] font-extrabold uppercase leading-none text-white">
        Ingresen a <span className="text-[#b51c1f]">la sala</span>
      </h1>
      <div className="mt-[32px] flex items-center justify-center gap-5">
        <span className="h-px w-[120px] bg-white/55" />
        <p className="text-[22px] font-extrabold uppercase leading-none tracking-[0.02em] text-white">
          Esperen las instrucciones para comenzar la misión
        </p>
        <span className="h-px w-[120px] bg-white/55" />
      </div>
    </section>
  )
}
