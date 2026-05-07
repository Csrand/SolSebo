import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { createSession, updateSession } from '../api/sessions';

function SessionFormPage() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const bookIdParam = searchParams.get('book');

  const [sessionType, setSessionType] = useState<'timer' | 'stopwatch'>('timer');
  const [plannedDuration, setPlannedDuration] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [phase, setPhase] = useState<'setup' | 'reading' | 'reflection' | 'done'>('setup');
  const [reflectionText, setReflectionText] = useState('');
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startTimer() {
    const totalSeconds = plannedDuration * 60;
    setTimeLeft(totalSeconds);
    setElapsed(0);
    setIsRunning(true);
    setIsPaused(false);
    setPhase('reading');
  }

  useEffect(() => {
    if (!isRunning || isPaused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          startReflection();
          return 0;
        }
        return prev - 1;
      });
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  function togglePause() {
    setIsPaused((p) => !p);
  }

  function startReflection() {
    setPhase('reflection');
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  async function handleStartSession(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const session = await createSession({
        bookId: Number(bookIdParam) || 1,
        sessionType,
        plannedDuration,
      });
      setSessionId(session.id);
      startTimer();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao iniciar sessão');
    }
  }

  async function handleFinish() {
    if (!sessionId) return;
    try {
      await updateSession(sessionId, {
        status: 'completed',
        actualDuration: Math.floor(elapsed / 60),
        reflectionText,
      });
      setPhase('done');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao finalizar sessão');
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <nav className="dashboard__nav">
          <span className="dashboard__logo">SolSebo</span>
          <div className="dashboard__links">
            <Link to="/dashboard" className="dashboard__link">Dashboard</Link>
            <Link to="/books" className="dashboard__link">Livros</Link>
            <Link to="/library" className="dashboard__link">Biblioteca</Link>
            <Link to="/sessions" className="dashboard__link dashboard__link--active">Sessões</Link>
            <Link to="/clubs" className="dashboard__link">Clubes</Link>
            {user?.is_admin && <Link to="/users" className="dashboard__link">Usuários</Link>}
          </div>
        </nav>
        <div className="dashboard__user">
          <span>Olá, {user?.username || 'Usuário'}</span>
          <Button variant="secondary" onClick={() => logout()}>Sair</Button>
        </div>
      </header>
      <main className="dashboard__content">
        <h1>{phase === 'setup' ? 'Nova Sessão de Leitura' : phase === 'reading' ? 'Lendo...' : phase === 'reflection' ? 'Reflita sobre o que você leu' : 'Sessão Concluída'}</h1>

        {error && <div className="alert alert--error">{error}</div>}

        {phase === 'setup' && (
          <div className="form-card">
            <form onSubmit={handleStartSession} className="auth-form">
              <Input label="ID do Livro" type="number" value={String(bookIdParam || '')} onChange={() => {}} disabled={!!bookIdParam} placeholder="ID do livro" />
              <div className="form-group">
                <label className="form-label">Tipo de Sessão</label>
                <select className="form-input" value={sessionType} onChange={(e) => setSessionType(e.target.value as 'timer' | 'stopwatch')}>
                  <option value="timer">Timer (Pomodoro)</option>
                  <option value="stopwatch">Cronômetro</option>
                </select>
              </div>
              <Input label="Tempo (minutos)" type="number" value={String(plannedDuration)} onChange={(e) => setPlannedDuration(Number(e.target.value))} min={1} />
              <Button type="submit" variant="primary" fullWidth>Iniciar Sessão</Button>
            </form>
          </div>
        )}

        {phase === 'reading' && (
          <div className="timer-container">
            <div className="timer-display">{formatTime(timeLeft)}</div>
            <p className="timer-label">Tempo restante</p>
            <div className="timer-actions">
              <Button variant="secondary" onClick={togglePause}>{isPaused ? 'Continuar' : 'Pausar'}</Button>
              <Button variant="secondary" onClick={handleFinish}>Finalizar</Button>
            </div>
          </div>
        )}

        {phase === 'reflection' && (
          <div className="form-card">
            <p className="reflection-prompt">O que você achou da leitura? Anote suas reflexões:</p>
            <textarea
              className="form-input reflection-input"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Escreva sobre sua experiência de leitura..."
              rows={5}
            />
            <Button variant="primary" onClick={handleFinish} style={{ marginTop: 16 }}>
              Finalizar Sessão
            </Button>
          </div>
        )}

        {phase === 'done' && (
          <div className="form-card">
            <div className="alert alert--success">Sessão salva com sucesso</div>
            <div className="form-card__actions">
              <Link to="/sessions" className="btn btn--primary">Ver Sessões</Link>
              <Link to="/sessions/new" className="btn btn--secondary">Nova Sessão</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export { SessionFormPage };
