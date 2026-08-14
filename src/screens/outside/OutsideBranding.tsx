export function OutsideBranding() {
  return (
    <>
      <img
        className="pointer-events-none absolute left-[64px] top-[54px] z-20 h-auto w-[158px]"
        src="/images/legrand.webp"
        alt="Legrand 40 años"
      />
      <div className="pointer-events-none absolute right-[64px] top-[58px] z-20 flex h-[98px] w-[292px] items-center justify-end overflow-hidden">
        <img
          className="h-full w-full object-contain object-right"
          src="/images/laboratorio.webp"
          alt="Laboratorios Legrand"
        />
      </div>
    </>
  )
}
