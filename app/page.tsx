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

  useEffect(() => {
    fetchMe();
    fetchCountdowns();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/login");
  };

  return (
    <main className="relative min-h-screen bg-[#F7F6F3] px-4 py-24 font-sans">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div
          className="absolute -right-1/4 -top-1/3 h-200 w-200"
          style={{
            background:
              'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)',
            animation: 'pulse 30s ease-in-out infinite',
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-4xl tracking-[-0.03em] leading-[1.1] text-[#111111]">
              Your countdowns
            </h1>
            <p className="mt-2 text-sm text-[#787774]">
              {username && <>{username} &mdash; </>}
              {countdowns.length}{' '}
              {countdowns.length === 1 ? 'countdown' : 'countdowns'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCreate((v) => !v);
                setEditingId(null);
              }}
              className="h-fit rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333333] active:scale-[0.98]"
            >
              {showCreate ? 'Cancel' : '+ New countdown'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="h-fit rounded-md border border-[#EAEAEA] bg-white px-4 py-2 text-sm font-medium text-[#787774] transition-colors hover:text-[#111111]"
            >
              Log out
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-8 rounded-md bg-[#FDEBEC] px-4 py-3 text-sm text-[#9F2F2D]">
            {error}
          </p>
        )}

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="mb-10 animate-[fade-up_0.4s_cubic-bezier(0.16,1,0.3,1)] rounded-xl border border-[#EAEAEA] bg-white p-6"
          >
            <h2 className="mb-5 font-serif text-xl tracking-[-0.02em] text-[#111111]">
              New countdown
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="create-title"
                  className="mb-1 block text-sm text-[#787774]"
                >
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
                  className="w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-[#111111] placeholder:text-[#787774] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>
              <div>
                <label
                  htmlFor="create-description"
                  className="mb-1 block text-sm text-[#787774]"
                >
                  Description
                </label>
                <textarea
                  id="create-description"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Optional details\u2026"
                  className="w-full resize-none rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-[#111111] placeholder:text-[#787774] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>
              <div>
                <label
                  htmlFor="create-due"
                  className="mb-1 block text-sm text-[#787774]"
                >
                  Due date
                </label>
                <input
                  id="create-due"
                  type="datetime-local"
                  value={createForm.due_date}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, due_date: e.target.value }))
                  }
                  className="w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-[#111111] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!createForm.title.trim() || !createForm.due_date}
              className="mt-5 rounded-md bg-[#111111] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333333] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create countdown
            </button>
          </form>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border border-[#EAEAEA] bg-white"
              />
            ))}
          </div>
        ) : countdowns.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-lg text-[#787774]">
              No countdowns yet.
            </p>
            <p className="mt-1 text-sm text-[#787774]">
              Click &quot;+ New countdown&quot; to get started.
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
                  className="animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)] rounded-xl border border-[#EAEAEA] bg-white p-6 transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, title: e.target.value }))
                        }
                        className="w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-[#111111] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
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
                        className="w-full resize-none rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-sm text-[#111111] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
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
                        className="w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2 text-sm text-[#111111] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate(c.id)}
                          disabled={
                            !editForm.title.trim() || !editForm.due_date
                          }
                          className="rounded-md bg-[#111111] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#333333] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setEditForm(emptyForm());
                          }}
                          className="rounded-md border border-[#EAEAEA] bg-white px-3 py-1.5 text-xs font-medium text-[#787774] transition-colors hover:text-[#111111]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <h3 className="text-lg font-medium text-[#111111]">
                          {c.title}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${
                            t.expired
                              ? 'bg-[#FDEBEC] text-[#9F2F2D]'
                              : 'bg-[#EDF3EC] text-[#346538]'
                          }`}
                        >
                          {t.expired
                            ? 'Expired'
                            : `${t.days}d ${t.hours}h ${t.minutes}m`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#787774]">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(
                              expandedId === c.id ? null : c.id,
                            )
                          }
                          className="flex items-center gap-1 transition-colors hover:text-[#111111]"
                        >
                          <span className="text-sm leading-none">
                            {expandedId === c.id ? '\u2212' : '+'}
                          </span>
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="transition-colors hover:text-[#111111]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="transition-colors hover:text-[#9F2F2D]"
                        >
                          Delete
                        </button>
                      </div>

                      {expandedId === c.id && (
                        <div className="mt-3 animate-[fade-up_0.3s_cubic-bezier(0.16,1,0.3,1)] border-t border-[#EAEAEA] pt-3">
                          <p className="text-sm leading-relaxed text-[#787774]">
                            {c.description || (
                              <span className="italic">No description</span>
                            )}
                          </p>
                          <p className="mt-2 text-xs text-[#787774]">
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
      </div>
    </main>
  );
}
