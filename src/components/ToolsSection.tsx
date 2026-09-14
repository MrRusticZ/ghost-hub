import { useEffect, useMemo, useState } from "react";

interface ToolsSectionProps {
  requestedTimerSeconds: number | null;
  onRequestHandled: () => void;
}

interface TimerState {
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  running: boolean;
  completed: boolean;
}

export function ToolsSection({ requestedTimerSeconds, onRequestHandled }: ToolsSectionProps) {
  const [customMinutes, setCustomMinutes] = useState("2");
  const [timer, setTimer] = useState<TimerState>({
    label: "Hunt Window",
    totalSeconds: 120,
    remainingSeconds: 120,
    running: false,
    completed: false
  });

  const presets = useMemo(() => [30, 60, 90, 120, 180, 300, 420], []);

  const startTimer = (seconds: number) => {
    setTimer({
      label: `${seconds}s Hunt Timer`,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      running: true,
      completed: false
    });
  };

  const pauseTimer = () => {
    setTimer((previous) => ({ ...previous, running: false }));
  };

  const resetTimer = () => {
    setTimer((previous) => ({
      ...previous,
      running: false,
      remainingSeconds: previous.totalSeconds,
      completed: false
    }));
  };

  useEffect(() => {
    if (!requestedTimerSeconds || requestedTimerSeconds <= 0) return;
    startTimer(requestedTimerSeconds);
    onRequestHandled();
  }, [requestedTimerSeconds, onRequestHandled]);

  useEffect(() => {
    if (!timer.running) return;

    const ticker = window.setInterval(() => {
      setTimer((previous) => {
        if (previous.remainingSeconds <= 1) {
          return { ...previous, running: false, remainingSeconds: 0, completed: true };
        }
        return {
          ...previous,
          remainingSeconds: previous.remainingSeconds - 1
        };
      });
    }, 1000);

    return () => window.clearInterval(ticker);
  }, [timer.running]);

  const percentLeft = timer.totalSeconds > 0 ? Math.round((timer.remainingSeconds / timer.totalSeconds) * 100) : 0;
  const displayTime = `${Math.floor(timer.remainingSeconds / 60)
    .toString()
    .padStart(2, "0")}:${String(timer.remainingSeconds % 60).padStart(2, "0")}`;

  const launchCustom = () => {
    const parsed = Number(customMinutes);
    if (Number.isFinite(parsed) && parsed > 0) {
      startTimer(Math.round(parsed * 60));
    }
  };

  const startCurrentTimer = () => {
    startTimer(timer.totalSeconds);
  };

  return (
    <section>
      <header className="section-header">
        <h2>Tools</h2>
        <p>Hunt timers, sanity pace logs, and reusable presets for rapid setup.</p>
      </header>

      <div className="panel timer-panel">
        <h3>{timer.label}</h3>
        <div className="timer-display">
          <span>{displayTime}</span>
          <progress value={percentLeft} max={100} />
        </div>

        <div className="row">
          <button onClick={startCurrentTimer} type="button">
            Start
          </button>
          <button onClick={pauseTimer} type="button">
            Pause
          </button>
          <button onClick={resetTimer} type="button">
            Reset
          </button>
        </div>

        {timer.completed ? <p className="muted">Timer complete. Start a new preset when ready.</p> : null}

        <div className="chip-row">
          {presets.map((seconds) => (
            <button key={seconds} className="chip" onClick={() => startTimer(seconds)} type="button">
              {Math.floor(seconds / 60)}m
            </button>
          ))}
        </div>

        <div className="row">
          <input
            value={customMinutes}
            onChange={(event) => setCustomMinutes(event.target.value)}
            type="number"
            min={1}
            max={90}
          />
          <button type="button" onClick={launchCustom}>
            Start custom (minutes)
          </button>
        </div>
      </div>

      <div className="panel">
        <h3>Quick Checklist</h3>
        <ul>
          <li>Use voice command: “start timer 3” for a 3 minute timer.</li>
          <li>Set and share your evidence lock before a map cycle.</li>
          <li>Take note of ghost event timing at each doorway/burnpoint.</li>
        </ul>
      </div>
    </section>
  );
}
