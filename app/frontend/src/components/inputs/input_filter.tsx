import type { InputHTMLAttributes } from 'react';

interface InputFilterProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export default function InputFilter({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  style,
  autoComplete,
  ...props
}: InputFilterProps) {
  const inputStyle = {
    ...style,
    WebkitBoxShadow: '0 0 0 1000px #000 inset',
    boxShadow: '0 0 0 1000px #000 inset',
    WebkitTextFillColor: '#fff',
  };

  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete ?? 'off'}
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      className={`h-10 min-w-[3rem] rounded-xl border border-border bg-black/80 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-white placeholder:opacity-50 ${className}`}
      style={inputStyle}
      {...props}
    />
  );
}
