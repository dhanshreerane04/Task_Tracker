import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "jtronix.task-tracker.v1";
const FILTERS = ["all", "pending", "completed"];
const SUGGESTIONS = ["Review portfolio", "Reply to emails", "Plan tomorrow"];

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function Icon({ name, size = 18 }) {
  const paths = {
    check: "M5 13l4 4L19 7",
    trash: "M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3",
    plus: "M12 5v14M5 12h14",
    spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z",
    arrow: "M5 12h13M13 6l6 6-6 6",
    target: "M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1m0-12.8l-2.1 2.1m-8.6 8.6l-2.1 2.1",
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function ProgressRing({ percent }) {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="ring" role="img" aria-label={`${percent}% of tasks completed`}>
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} className="ring-bg" />
        <circle cx="40" cy="40" r={r} className="ring-fg" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * percent) / 100} />
      </svg>
      <span>{percent}<small>%</small></span>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task ${task.completed ? "done" : ""}`}>
      <label className="task-main">
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
        <span className="box"><Icon name="check" size={15} /></span>
        <span className="task-copy">
          <span className="task-text">{task.text}</span>
          <span className="task-meta">{task.completed ? "Completed just now" : "Ready when you are"}</span>
        </span>
      </label>
      <span className={`badge ${task.completed ? "badge-done" : "badge-pending"}`}>
        <i /> {task.completed ? "Done" : "In progress"}
      </span>
      <button className="icon-btn" onClick={() => onDelete(task.id)} aria-label={`Delete task: ${task.text}`}>
        <Icon name="trash" size={17} />
      </button>
    </li>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const inputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch { /* App remains usable in memory. */ }
  }, [tasks]);

  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const visible = useMemo(() => {
    if (filter === "pending") return tasks.filter((task) => !task.completed);
    if (filter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, filter]);
  const counts = { all: total, pending, completed };
  const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  function addTask(event) {
    event.preventDefault();
    const clean = text.trim();
    if (!clean) {
      setError("Give your task a name first.");
      inputRef.current?.focus();
      return;
    }
    setTasks([{ id: crypto.randomUUID(), text: clean, completed: false }, ...tasks]);
    setText("");
    setError("");
    if (filter === "completed") setFilter("all");
  }

  const toggleTask = (id) => setTasks(tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  const deleteTask = (id) => setTasks(tasks.filter((task) => task.id !== id));
  const clearCompleted = () => setTasks(tasks.filter((task) => !task.completed));

  const emptyMessage = total === 0
    ? ["Your board is clear", "Capture your first win and make the day count."]
    : filter === "pending"
      ? ["You’re all caught up", "No pending tasks. Enjoy the momentum."]
      : ["No completed tasks yet", "Finish a task and it will show up here."];

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="wrap topbar-in">
          <div className="brand-lockup">
            <span className="logo"><Icon name="spark" size={19} /></span>
            <span><strong>Taskflow</strong><small>Personal command center</small></span>
          </div>
          <div className="topbar-tools"><span className="workspace-pill"><span className="status-dot" /> Local workspace</span><span className="shortcut">⌘ K</span><div className="avatar">JD</div><div className="topbar-date">{dateLabel}</div></div>
        </div>
      </header>

      <main className="wrap main-content">
        <section className="hero-copy">
          <div>
            <p className="eyebrow"><Icon name="target" size={14} /> Focus mode</p>
            <h1>Make space for<br /><em>what matters.</em></h1>
            <p className="hero-sub">A calmer way to plan, prioritize, and keep your promises to yourself.</p>
          </div>
          <div className="hero-mark" aria-hidden="true"><span /><span /><span /></div>
        </section>

        <section className="card">
          <div className="summary">
            <div>
              <p className="section-kicker">Today’s overview</p>
              <h2>{total === 0 ? "Start with one small win" : pending === 0 ? "Beautiful work. You’re clear." : `${pending} ${pending === 1 ? "thing" : "things"} still in motion`}</h2>
              <p className="muted">{total === 0 ? "The best time to begin is now." : `${completed} of ${total} tasks completed today.`}</p>
            </div>
            <ProgressRing percent={percent} />
          </div>

          <form className="add" onSubmit={addTask} noValidate>
            <div className="field">
              <span className="field-icon"><Icon name="plus" size={18} /></span>
              <input ref={inputRef} value={text} maxLength={120} onChange={(event) => { setText(event.target.value); setError(""); }} placeholder="Add a task to your day..." aria-label="New task" aria-invalid={!!error} className={error ? "invalid" : ""} />
              {error && <p className="error" role="alert">{error}</p>}
            </div>
            <button className="btn-primary" type="submit">Add task <Icon name="arrow" size={17} /></button>
          </form>
          <div className="suggestions"><span>Quick add</span>{SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => { setText(suggestion); setError(""); inputRef.current?.focus(); }}>+ {suggestion}</button>)}</div>

          <div className="stats">
            <div><span>All tasks</span><strong>{total}</strong><small>On your board</small></div>
            <div><span>Completed</span><strong className="c-green">{completed}</strong><small>Nice momentum</small></div>
            <div><span>Remaining</span><strong className="c-amber">{pending}</strong><small>Within reach</small></div>
          </div>

          <div className="list-head"><div><p className="section-kicker">Your queue</p><h3>{filter === "all" ? "All tasks" : `${filter[0].toUpperCase() + filter.slice(1)} tasks`}</h3></div><span className="task-count">{visible.length} {visible.length === 1 ? "item" : "items"}</span></div>
          <div className="toolbar">
            <div className="filters" role="group" aria-label="Filter tasks">
              {FILTERS.map((option) => (
                <button key={option} className={filter === option ? "chip active" : "chip"} onClick={() => setFilter(option)} aria-pressed={filter === option}>
                  {option[0].toUpperCase() + option.slice(1)} <em>{counts[option]}</em>
                </button>
              ))}
            </div>
            <span className="saved"><span className="saved-check"><Icon name="check" size={12} /></span> Autosaved locally</span>
          </div>

          {visible.length ? <ul className="list">{visible.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)}</ul> : <div className="empty"><span className="empty-icon"><Icon name="spark" size={22} /></span><strong>{emptyMessage[0]}</strong><p className="muted">{emptyMessage[1]}</p></div>}
          {completed > 0 && <button className="btn-ghost" onClick={clearCompleted}>Clear completed <span>{completed}</span></button>}
        </section>
        <p className="footer-note">Built for clarity <span>·</span> Your tasks stay on this device</p>
      </main>
    </div>
  );
}
