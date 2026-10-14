'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Win, WinFormState, WinsMeta } from '../types';
import { emptyWinForm, WINS_PER_PAGE } from '../utils';
import { WinCard } from './win-card';
import { WinModal } from './win-modal';

export function WinsSection() {
    const router = useRouter();
    const [wins, setWins] = useState<Win[]>([]);
    const [winsLoading, setWinsLoading] = useState(true);
    const [winsError, setWinsError] = useState<string | null>(null);
    const [winsMeta, setWinsMeta] = useState<WinsMeta | null>(null);
    const [winModalOpen, setWinModalOpen] = useState(false);
    const [editingWinId, setEditingWinId] = useState<string | null>(null);
    const [winForm, setWinForm] = useState<WinFormState>(emptyWinForm());

    const fetchWins = async (page = 1) => {
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
            setWinsError(null);
        } catch (e) {
            setWinsError(e instanceof Error ? e.message : 'Something went wrong');
        } finally {
            setWinsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount is intentional
        fetchWins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return (
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
                            <WinCard
                                key={w.id}
                                win={w}
                                index={i}
                                onEdit={openEditWin}
                                onDelete={handleDeleteWin}
                            />
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

            {winModalOpen && (
                <WinModal
                    editing={editingWinId !== null}
                    form={winForm}
                    onChange={setWinForm}
                    onSubmit={handleWinSubmit}
                    onClose={closeWinModal}
                />
            )}
        </section>
    );
}
