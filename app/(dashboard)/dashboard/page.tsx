'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

interface Countdown {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
}

interface FormState {
  title: string;
  description: string;
  due_date: string;
}

const emptyForm = (): FormState => ({
  title: '',
  description: '',
  due_date: '',
});

interface Win {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface WinFormState {
  title: string;
  description: string;
}

interface WinsMeta {
  page: number;
  perPage: number;
  total: number;
  totalPage: number;
}

const WINS_PER_PAGE = 10;

const emptyWinForm = (): WinFormState => ({
  title: '',
  description: '',
});

const getTimeRemaining = (dueDate: string) => {
  const diff = new Date(dueDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, expired: false };
};

const formatDateTimeLocal = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function Home() {
  const router = useRouter();
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [tick, setTick] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const [wins, setWins] = useState<Win[]>([]);
  const [winsLoading, setWinsLoading] = useState(true);
  const [winsError, setWinsError] = useState<string | null>(null);
  const [winsMeta, setWinsMeta] = useState<WinsMeta | null>(null);
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [editingWinId, setEditingWinId] = useState<string | null>(null);
  const [winForm, setWinForm] = useState<WinFormState>(emptyWinForm());

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const user = await res.json();
        setUsername(user.username);
      }
    } catch {
      // ignore
    }
  };

  const fetchCountdowns = async () => {
    setError(null);
    try {
      const res = await fetch('/api/countdowns');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch countdowns');
      const json = await res.json();
      setCountdowns(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fetchWins = async (page = 1) => {
    setWinsError(null);
    try {
      const res = await fetch(`/api/wins?page=${page}&perPage=${WINS_PER_PAGE}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch wins');
      const json = await res.json();
      setWins(json.data ?? []);
      setWinsMeta(json.meta ?? null);
    } catch (e) {
      setWinsError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setWinsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    fetchCountdowns();
    fetchWins();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!winModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setWinModalOpen(false);
        setEditingWinId(null);
        setWinForm(emptyWinForm());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [winModalOpen]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.due_date) return;
    setError(null);
    try {
      const res = await fetch('/api/countdowns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim() || undefined,
          due_date: createForm.due_date,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Failed to create countdown');
      }
      setShowCreate(false);
      setCreateForm(emptyForm());
      await fetchCountdowns();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  const startEdit = (c: Countdown) => {
    setEditingId(c.id);
    setEditForm({
      title: c.title,
      description: c.description ?? '',
      due_date: formatDateTimeLocal(c.due_date),
    });
    setExpandedId(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.title.trim() || !editForm.due_date) return;
    setError(null);
    try {
      const res = await fetch(`/api/countdowns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim() || undefined,
          due_date: editForm.due_date,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Failed to update countdown');
      }
      setEditingId(null);
      setEditForm(emptyForm());
      await fetchCountdowns();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this countdown?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/countdowns/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Failed to delete countdown');
      }
      await fetchCountdowns();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  const openCreateWin = () => {
    setEditingWinId(null);
    setWinForm(emptyWinForm());
    setWinModalOpen(true);
  };

  const openEditWin = (w: Win) => {
    setEditingWinId(w.id);
    setWinForm({ title: w.title, description: w.description ?? '' });
    setWinModalOpen(true);
  };

  const closeWinModal = () => {
    setWinModalOpen(false);
    setEditingWinId(null);
    setWinForm(emptyWinForm());
  };

  const handleWinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!winForm.title.trim()) return;
    setWinsError(null);
    const editing = editingWinId !== null;
    try {
      const res = await fetch(
        editing ? `/api/wins/${editingWinId}` : '/api/wins',
        {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: winForm.title.trim(),
            description: winForm.description.trim() || undefined,
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.message ??
            (editing ? 'Failed to update win' : 'Failed to create win'),
        );
      }
      closeWinModal();
      await fetchWins(winsMeta?.page ?? 1);
    } catch (e) {
      setWinsError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  const handleDeleteWin = async (id: string) => {
    if (!confirm('Delete this win?')) return;
    setWinsError(null);
    try {
      const res = await fetch(`/api/wins/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Failed to delete win');
      }
      const current = winsMeta?.page ?? 1;
      const nextPage = wins.length === 1 && current > 1 ? current - 1 : current;
      await fetchWins(nextPage);
    } catch (e) {
      setWinsError(e instanceof Error ? e.message : 'Something went wrong');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/");
  };

  return (
    <main className="flex-1 px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-sans text-[2.1875rem] leading-none md:text-[2.1875rem]">
              Your countdowns
            </h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
              {username && <>{username} &mdash; </>}
              {countdowns.length}{' '}
              {countdowns.length === 1 ? 'countdown' : 'countdowns'}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setShowCreate((v) => !v);
                setEditingId(null);
              }}
              className="btn-sega bg-primary text-white"
            >
              {showCreate ? 'Cancel' : '+ New countdown'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-sega bg-secondary text-ink"
            >
              Log out
            </button>
          </div>
        </header>

        {error && (
          <p className="mb-8 badge-sega bg-danger text-white text-sm">
            {error}
          </p>
        )}

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="card-sega mb-10"
            style={{ animation: 'fade-up 0.4s cubic-bezier(0.16,1,0.3,1)' }}
          >
            <h2 className="mb-6 font-sans text-[1.6875rem] leading-none">
              New countdown
            </h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="create-title" className="label-sega">
                  Title
                </label>
                <input
                  id="create-title"
                  type="text"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="What are you counting down to?"
                  className="input-sega"
                />
              </div>
              <div>
                <label htmlFor="create-description" className="label-sega">
                  Description
                </label>
                <textarea
                  id="create-description"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Optional details..."
                  className="input-sega resize-none"
                />
              </div>
              <div>
                <label htmlFor="create-due" className="label-sega">
                  Due date
                </label>
                <input
                  id="create-due"
                  type="datetime-local"
                  value={createForm.due_date}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, due_date: e.target.value }))
                  }
                  className="input-sega"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!createForm.title.trim() || !createForm.due_date}
              className="btn-sega mt-6 bg-primary text-white"
            >
              Create countdown
            </button>
          </form>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card-sega"
                style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
              >
                <div className="h-5 w-2/3 rounded bg-[#E5E7EB]" />
                <div className="mt-3 h-4 w-1/3 rounded bg-[#E5E7EB]" />
                <div className="mt-4 h-3 w-1/4 rounded bg-[#E5E7EB]" />
              </div>
            ))}
          </div>
        ) : countdowns.length === 0 ? (
          <div className="card-sega mt-8 text-center md:mt-16">
            <p className="font-sans text-[1.6875rem] leading-none">
              No countdowns yet.
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
              Click &ldquo;+ New countdown&rdquo; to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {countdowns.map((c, i) => {
              const t = getTimeRemaining(c.due_date);
              const isEditing = editingId === c.id;
              return (
                <div
                  key={c.id}
                  className="card-sega"
                  style={{
                    animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1)',
                    animationDelay: `${i * 80}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, title: e.target.value }))
                        }
                        className="input-sega"
                      />
                      <textarea
                        rows={2}
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        className="input-sega resize-none"
                      />
                      <input
                        type="datetime-local"
                        value={editForm.due_date}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            due_date: e.target.value,
                          }))
                        }
                        className="input-sega"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate(c.id)}
                          disabled={
                            !editForm.title.trim() || !editForm.due_date
                          }
                          className="btn-sega btn-sega--sm bg-primary text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditForm(emptyForm());
                          }}
                          className="btn-sega btn-sega--sm bg-white text-ink"
                          style={{ boxShadow: '2px 2px 0px #111827' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <h3 className="font-sans text-[1.3125rem] leading-tight md:text-[1.6875rem]">
                          {c.title}
                        </h3>
                        <span
                          className={`badge-sega shrink-0 ${
                            t.expired
                              ? 'bg-danger text-white'
                              : 'bg-success text-white'
                          }`}
                        >
                          {t.expired
                            ? 'Expired'
                            : `${t.days}d ${t.hours}h ${t.minutes}m`}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(
                              expandedId === c.id ? null : c.id,
                            )
                          }
                          className="link-sega flex items-center gap-1"
                        >
                          <span className="text-base leading-none">
                            {expandedId === c.id ? '\u2212' : '+'}
                          </span>
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="link-sega"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="font-mono text-xs uppercase tracking-widest text-danger underline-offset-2 hover:underline"
                          style={{ fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace' }}
                        >
                          Delete
                        </button>
                      </div>

                      {expandedId === c.id && (
                        <div className="mt-4 border-t-2 border-ink pt-4">
                          <p className="font-sans text-[1.0625rem] leading-snug text-[#4B5563]">
                            {c.description || (
                              <span className="italic opacity-60">No description</span>
                            )}
                          </p>
                          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                            Due{' '}
                            {new Date(c.due_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <section className="mt-16">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-sans text-[2.1875rem] leading-none">Wins</h2>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                {winsMeta?.total ?? wins.length}{' '}
                {(winsMeta?.total ?? wins.length) === 1 ? 'win' : 'wins'}
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateWin}
              className="btn-sega bg-primary text-white"
            >
              + New win
            </button>
          </header>

          {winsError && (
            <p className="mb-8 badge-sega bg-danger text-white text-sm">
              {winsError}
            </p>
          )}

          {winsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="card-sega"
                  style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
                >
                  <div className="h-5 w-2/3 rounded bg-[#E5E7EB]" />
                  <div className="mt-3 h-4 w-1/3 rounded bg-[#E5E7EB]" />
                </div>
              ))}
            </div>
          ) : wins.length === 0 ? (
            <div className="card-sega text-center">
              <p className="font-sans text-[1.6875rem] leading-none">
                No wins yet.
              </p>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                Click &ldquo;+ New win&rdquo; to celebrate a milestone.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {wins.map((w, i) => (
                  <div
                    key={w.id}
                    className="card-sega"
                    style={{
                      animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1)',
                      animationDelay: `${i * 80}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <h3 className="font-sans text-[1.3125rem] leading-tight md:text-[1.6875rem]">
                        {w.title}
                      </h3>
                      <span className="badge-sega shrink-0 bg-secondary text-ink">
                        Win
                      </span>
                    </div>
                    <p className="font-sans text-[1.0625rem] leading-snug text-[#4B5563]">
                      {w.description || (
                        <span className="italic opacity-60">
                          No description
                        </span>
                      )}
                    </p>
                    <p className="mt-3 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                      Won{' '}
                      {new Date(w.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="mt-4 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                      <button
                        type="button"
                        onClick={() => openEditWin(w)}
                        className="link-sega"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWin(w.id)}
                        className="font-mono text-xs uppercase tracking-widest text-danger underline-offset-2 hover:underline"
                        style={{
                          fontFamily:
                            'var(--font-jetbrains), JetBrains Mono, monospace',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {winsMeta && winsMeta.totalPage > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                  <button
                    type="button"
                    onClick={() => fetchWins(winsMeta.page - 1)}
                    disabled={winsMeta.page <= 1}
                    className="btn-sega btn-sega--sm bg-white text-ink"
                  >
                    Prev
                  </button>
                  <span>
                    Page {winsMeta.page} of {winsMeta.totalPage}
                  </span>
                  <button
                    type="button"
                    onClick={() => fetchWins(winsMeta.page + 1)}
                    disabled={winsMeta.page >= winsMeta.totalPage}
                    className="btn-sega btn-sega--sm bg-white text-ink"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {winModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeWinModal}
          style={{ animation: 'fade-up 0.2s ease-out' }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="win-modal-title"
            className="card-sega w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="win-modal-title"
              className="mb-6 font-sans text-[1.6875rem] leading-none"
            >
              {editingWinId ? 'Update win' : 'New win'}
            </h2>
            <form onSubmit={handleWinSubmit} className="space-y-5">
              <div>
                <label htmlFor="win-title" className="label-sega">
                  Title
                </label>
                <input
                  id="win-title"
                  type="text"
                  value={winForm.title}
                  onChange={(e) =>
                    setWinForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="What did you accomplish?"
                  className="input-sega"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="win-description" className="label-sega">
                  Description
                </label>
                <textarea
                  id="win-description"
                  rows={3}
                  value={winForm.description}
                  onChange={(e) =>
                    setWinForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Optional details..."
                  className="input-sega resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!winForm.title.trim()}
                  className="btn-sega bg-primary text-white"
                >
                  {editingWinId ? 'Save changes' : 'Create win'}
                </button>
                <button
                  type="button"
                  onClick={closeWinModal}
                  className="btn-sega bg-white text-ink"
                  style={{ boxShadow: '2px 2px 0px #111827' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
