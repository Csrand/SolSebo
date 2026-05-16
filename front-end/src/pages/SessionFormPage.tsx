import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { createSession, getSession, updateSession } from "../api/sessions";
import { getBook, type Book } from "../api/books";

function SessionFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get("book");
  const sessionId = searchParams.get("session");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [book, setBook] = useState<Book | null>(null);
  const [mode, setMode] = useState<"timer" | "stopwatch">("timer");
  const [plannedMinutes, setPlannedMinutes] = useState(25);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionDuration, setReflectionDuration] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bookId) getBook(Number(bookId)).then(setBook).catch(() => {});
  }, [bookId]);

  function startSession() {
    setSessionCreated(true);
    setIsRunning(true);
    setElapsed(0);
    if (mode === "timer") setRemaining(plannedMinutes * 60);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (mode === "timer") setRemaining(plannedMinutes * 60 - next);
        if (mode === "timer" && next >= plannedMinutes * 60) {
          stopSession(next);
          return next;
        }
        if (mode === "stopwatch") setRemaining(next);
        return next;
      });
    }, 1000);
  }

  function stopSession(finalElapsed?: number) {
    const totalSeconds = finalElapsed ?? elapsed;
    setIsRunning(false);
    setIsFinished(true);
    const totalMinutes = Math.round(totalSeconds / 60);
    const reflection = Math.floor(totalMinutes * 0.2);
    setReflectionDuration(reflection);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  async function handleFinish() {
    if (!bookId && !sessionId) return;
    setError("");
    try {
      if (sessionId && !sessionCreated) {
        await updateSession(Number(sessionId), {
          status: "completed",
          actualDuration: Math.round(elapsed / 60),
          reflectionText,
        });
      } else {
        const session = await createSession({
          bookId: Number(bookId || searchParams.get("book")),
          sessionType: mode,
          plannedDuration: mode === "timer" ? plannedMinutes : undefined,
        });
        await updateSession(session.id, {
          status: "completed",
          actualDuration: Math.round(elapsed / 60),
          reflectionText,
        });
      }
      navigate("/sessions");
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Erro ao finalizar sessão");
    }
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="session-form">
      <div className="dashboard__header-row">
        <h1>{sessionCreated ? "Sessão Ativa" : "Nova Sessão de Leitura"}</h1>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {!sessionCreated && !isFinished && (
        <>
          {book && (
            <div className="book-info">
              <p><strong>{book.title}</strong> - {book.author}</p>
            </div>
          )}

          <div className="session-config">
            <div className="session-config__mode">
              <label>
                <input type="radio" value="timer" checked={mode === "timer"} onChange={() => setMode("timer")} />
                Timer
              </label>
              <label>
                <input type="radio" value="stopwatch" checked={mode === "stopwatch"} onChange={() => setMode("stopwatch")} />
                Cronômetro
              </label>
            </div>

            {mode === "timer" && (
              <div className="session-config__duration">
                <label>Duração planejada (minutos):</label>
                <input type="number" min={1} max={180} value={plannedMinutes} onChange={(e) => setPlannedMinutes(Number(e.target.value))} />
              </div>
            )}

            <Button variant="primary" onClick={startSession}>
              {mode === "timer" ? "Iniciar Timer" : "Iniciar Cronômetro"}
            </Button>
          </div>
        </>
      )}

      {isRunning && (
        <div className="session-timer">
          <div className="session-timer__display">{formatTime(mode === "timer" ? remaining : elapsed)}</div>
          <Button variant="danger" onClick={() => stopSession()}>Parar</Button>
        </div>
      )}

      {isFinished && (
        <div className="session-reflection">
          <h2>Sessão Finalizada</h2>
          <p>Duração: {Math.round(elapsed / 60)} minutos</p>
          <p>Tempo de reflexão sugerido: {reflectionDuration} minutos (20%)</p>
          <div className="session-reflection__input">
            <label>O que você achou da leitura?</label>
            <textarea value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} rows={5} placeholder="Compartilhe suas impressões sobre o que leu..." />
          </div>
          <Button variant="primary" onClick={handleFinish} disabled={!reflectionText.trim()}>
            Salvar e Finalizar
          </Button>
        </div>
      )}
    </div>
  );
}

export { SessionFormPage };
