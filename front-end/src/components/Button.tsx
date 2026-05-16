interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "link";
  isLoading?: boolean;
  fullWidth?: boolean;
}

function Button({
  children,
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} ${fullWidth ? "btn--full-width" : ""} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? "Carregando..." : children}
    </button>
  );
}

export { Button };
