import type { InputHTMLAttributes } from 'react'

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  variant?: 'default' | 'compact'
}

export function TextInput({ variant = 'default', ...props }: TextInputProps) {
  const sizeClass =
    variant === 'compact'
      ? 'h-[56px] rounded-[11px] px-[26px] text-[23px]'
      : 'h-[64px] rounded-[13px] px-[32px] text-[25px]'

  return (
    <input
      className={`${sizeClass} w-full border-0 bg-white text-center font-light uppercase tracking-[0.28em] text-slate-950 shadow-2xl outline-none placeholder:text-[#c4c7cc] focus:ring-4 focus:ring-[#28e6b2]/60`}
      {...props}
    />
  )
}
