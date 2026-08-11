import type { InputHTMLAttributes } from 'react'

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  variant?: 'default' | 'compact'
}

export function TextInput({ variant = 'default', ...props }: TextInputProps) {
  const sizeClass =
    variant === 'compact'
      ? 'h-[56px] rounded-[8px] px-[26px] text-[23px]'
      : 'h-[64px] rounded-[9px] px-[32px] text-[25px]'

  return (
    <input
      className={`${sizeClass} w-full border-0 bg-white text-center font-just font-light uppercase tracking-[0.34em] text-[#151515] shadow-[0_10px_22px_rgba(0,0,0,0.24)] outline-none placeholder:text-[#cfd0d6] focus:ring-4 focus:ring-[#b51c1f]/45`}
      {...props}
    />
  )
}
