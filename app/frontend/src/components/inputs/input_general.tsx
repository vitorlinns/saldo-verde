import type { InputHTMLAttributes } from 'react';

interface InputGeneralProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export default function InputGeneral({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  style,
  autoComplete,
  ...props
}: InputGeneralProps) {
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
      className={`mt-2 w-full rounded-xl border border-border bg-black px-4 py-3 text-base text-white outline-none transition ${className}`}
      style={inputStyle}
      {...props}
    />
  );
}
