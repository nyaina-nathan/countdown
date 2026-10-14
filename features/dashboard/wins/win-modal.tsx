import { type FormEvent } from 'react';
import { WinFormState } from '../types';

interface WinModalProps {
    editing: boolean;
    form: WinFormState;
    onChange: (form: WinFormState) => void;
    onSubmit: (e: FormEvent) => void;
    onClose: () => void;
}

export function WinModal({
    editing,
    form,
    onChange,
    onSubmit,
    onClose,
}: WinModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
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
                    {editing ? 'Update win' : 'New win'}
                </h2>
                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="win-title" className="label-sega">
                            Title
                        </label>
                        <input
                            id="win-title"
                            type="text"
                            value={form.title}
                            onChange={(e) =>
                                onChange({ ...form, title: e.target.value })
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
                            value={form.description}
                            onChange={(e) =>
                                onChange({ ...form, description: e.target.value })
                            }
                            placeholder="Optional details..."
                            className="input-sega resize-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={!form.title.trim()}
                            className="btn-sega bg-primary text-white"
                        >
                            {editing ? 'Save changes' : 'Create win'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-sega bg-white text-ink"
                            style={{ boxShadow: '2px 2px 0px #111827' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
