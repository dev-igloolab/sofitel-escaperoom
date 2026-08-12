import type { ReactNode } from 'react'

export function LightChallengeShell({
  children,
  formattedTime,
}: {
  children: ReactNode
  formattedTime: string
}) {
  return (
    <section className="absolute inset-0 z-10 h-full w-full text-center font-just">
      <img
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-[60px] h-auto w-[1560px] -translate-x-1/2 object-contain"
        src="/images/fondo-2-carta.png"
      />

      <div className="absolute right-[320px] top-[242px] z-10 rounded-[8px] border border-[#c95c65]/70 bg-white/38 px-[16px] py-[9px]">
        <p className="text-[42px] font-extrabold leading-none tracking-[0.01em] text-[#b44a55]">
          {formattedTime}
        </p>
      </div>

      {children}

      <img
        alt="Laboratorios Legrand"
        className="absolute bottom-[108px] left-1/2 z-10 h-auto w-[280px] -translate-x-1/2"
        src="/images/laboratorio-rojo.webp"
      />
    </section>
  )
}
