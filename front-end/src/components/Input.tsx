interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Input({ label, error, id, className = "", ...rest }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="form-group">
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      <input
        id={inputId}
        className={`form-input ${error ? "form-input--error" : ""} ${className}`}
        {...rest}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export { Input };
