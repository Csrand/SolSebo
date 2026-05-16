import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../api/auth";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação não encontrado.");
      return;
    }

    verifyEmail({ token })
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.message || "Erro ao verificar email.");
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verificar Email</h1>
        {status === "loading" && <p className="auth-footer">Verificando...</p>}
        {status === "success" && (
          <>
            <div className="alert alert--success">{message}</div>
            <p className="auth-footer">
              <Link to="/login">Ir para o login</Link>
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="alert alert--error">{message}</div>
            <p className="auth-footer">
              <Link to="/login">Voltar ao login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export { VerifyEmailPage };
