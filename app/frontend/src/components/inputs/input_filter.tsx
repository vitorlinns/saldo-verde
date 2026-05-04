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
      className={`h-11 min-w-[1rem] rounded-[0.5rem] border border-border bg-surface px-4 text-sm font-regular text-white outline-none transition placeholder:text-white placeholder:opacity-50 ${className}`}
      style={inputStyle}
      {...props}
    />
  );
}
