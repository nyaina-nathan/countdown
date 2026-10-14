'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Countdown, CountdownFormState } from '../types';
import { emptyCountdownForm, formatDateTimeLocal } from '../utils';
import { CountdownCard } from './countdown-card';
import { CountdownCreateForm } from './countdown-create-form';

export function CountdownsSection() {
    const router = useRouter();
    const [countdowns, setCountdowns] = useState<Countdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState<CountdownFormState>(emptyCountdownForm());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<CountdownFormState>(emptyCountdownForm());
    const [, setTick] = useState(0);

    const fetchCountdowns = async () => {
        try {
            const res = await fetch('/api/countdowns');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch countdowns');
            const json = await res.json();
            setCountdowns(json.data ?? []);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount is intentional
        fetchCountdowns();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setCreateForm(emptyCountdownForm());
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

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(emptyCountdownForm());
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
            setEditForm(emptyCountdownForm());
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

    const toggleDetails = (id: string) => {
        setExpandedId((current) => (current === id ? null : id));
    };

    return (
        <section>
            <header className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="font-sans text-[2.1875rem] leading-none md:text-[2.1875rem]">
                        Your countdowns
                    </h1>
                    <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                        {countdowns.length}{' '}
                        {countdowns.length === 1 ? 'countdown' : 'countdowns'}
                    </p>
                </div>
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
            </header>

            {error && (
                <p className="mb-8 badge-sega bg-danger text-white text-sm">
                    {error}
                </p>
            )}

            {showCreate && (
                <CountdownCreateForm
                    form={createForm}
                    onChange={setCreateForm}
                    onSubmit={handleCreate}
                />
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
                    {countdowns.map((c, i) => (
                        <CountdownCard
                            key={c.id}
                            countdown={c}
                            index={i}
                            isEditing={editingId === c.id}
                            isExpanded={expandedId === c.id}
                            editForm={editForm}
                            onEditFormChange={setEditForm}
                            onStartEdit={startEdit}
                            onCancelEdit={cancelEdit}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onToggleDetails={toggleDetails}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
