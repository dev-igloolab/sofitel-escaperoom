export function GameInProgressScreen() {
  return (
    <section className="flex h-full w-full flex-col items-center justify-center px-[120px] text-center">
      <p className="text-[18px] font-bold uppercase tracking-[0.34em] text-[#28e6b2]">
        Misión en curso
      </p>
      <h1 className="mt-6 max-w-[1120px] font-display text-[72px] uppercase leading-tight text-white">
        Registro en pausa
      </h1>
      <p className="mt-8 max-w-[820px] text-[24px] font-light leading-snug text-white/80">
        Esperen a que el grupo actual termine la misión para poder realizar un
        nuevo registro.
      </p>
    </section>
  )
}
