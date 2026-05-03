import { useState } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  const inputStyle = {
    ...style,
   
    WebkitTextFillColor: '#fff',
  };

  return (
    <div className={`relative mt-2 w-full ${className}`}> 
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete ?? 'off'}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full rounded-[0.5rem] border border-border bg-background px-4 py-3 pr-12 text-base text-white outline-none transition placeholder:text-white placeholder:opacity-30"
        style={inputStyle}
        {...props}
      />

      {isPasswordField ? (
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white opacity-70 transition hover:opacity-100"
          aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
        >
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5c-7 0-11-7.5-11-7.5a19.41 19.41 0 0 1 4.06-4.94" />
              <path d="M1 1l22 22" />
              <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
              <path d="M14.12 5.88A10.94 10.94 0 0 1 23 12s-4 7.5-11 7.5a10.94 10.94 0 0 1-6.88-2.62" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      ) : null}
    </div>
  );
}
