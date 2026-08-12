export function OutsideBranding() {
  return (
    <>
      <img
        className="pointer-events-none absolute left-[72px] top-[64px] z-20 h-auto w-[118px]"
        src="/images/legrand.webp"
        alt="Legrand 40 años"
      />
      <div className="pointer-events-none absolute right-[72px] top-[70px] z-20 flex h-[72px] w-[214px] items-center justify-end overflow-hidden">
        <img
          className="h-full w-full object-contain object-right"
          src="/images/laboratorio.webp"
          alt="Laboratorios Legrand"
        />
      </div>
    </>
  )
}
