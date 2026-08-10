export function BriefTag({
  children,
  className = '',
}: {
  children: string
  className?: string
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="w-full bg-white px-5 py-[6px] text-center text-[24px] font-bold uppercase leading-tight text-black [clip-path:polygon(0_0,100%_0,100%_100%,10%_100%,0_58%)]">
        {children}
      </div>
      <span className="ml-auto mt-2 h-1 w-[72%] bg-[#16d2c6]" />
    </div>
  )
}
