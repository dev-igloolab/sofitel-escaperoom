type BrandLockupProps = {
  className?: string
}

export function BrandLockup({ className = '' }: BrandLockupProps) {
  return (
    <div
      className={`flex items-center justify-center gap-[18px] ${className}`}
    >
      <img
        className="h-auto w-[102px] -translate-y-[5px]"
        src="/images/beat.png"
        alt="Next Beat"
      />
      <span
        className="h-[42px] w-[2px] bg-white/80"
        aria-hidden="true"
      />
      <img
        className="h-auto w-[106px]"
        src="/images/sanofi.png"
        alt="Sanofi"
      />
    </div>
  )
}
