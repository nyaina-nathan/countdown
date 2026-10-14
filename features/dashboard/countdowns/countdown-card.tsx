import { Countdown, CountdownFormState } from '../types';
import { getTimeRemaining } from '../utils';

interface CountdownCardProps {
    countdown: Countdown;
    index: number;
    isEditing: boolean;
    isExpanded: boolean;
    editForm: CountdownFormState;
    onEditFormChange: (form: CountdownFormState) => void;
    onStartEdit: (countdown: Countdown) => void;
    onCancelEdit: () => void;
    onUpdate: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleDetails: (id: string) => void;
}

export function CountdownCard({
    countdown,
    index,
    isEditing,
    isExpanded,
    editForm,
    onEditFormChange,
    onStartEdit,
    onCancelEdit,
    onUpdate,
    onDelete,
    onToggleDetails,
}: CountdownCardProps) {
    const t = getTimeRemaining(countdown.due_date);

    return (
        <div
            className="card-sega"
            style={{
                animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1)',
                animationDelay: `${index * 80}ms`,
                animationFillMode: 'both',
            }}
        >
            {isEditing ? (
                <div className="space-y-4">
                    <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                            onEditFormChange({ ...editForm, title: e.target.value })
                        }
                        className="input-sega"
                    />
                    <textarea
                        rows={2}
                        value={editForm.description}
                        onChange={(e) =>
                            onEditFormChange({
                                ...editForm,
                                description: e.target.value,
                            })
                        }
                        className="input-sega resize-none"
                    />
                    <input
                        type="datetime-local"
                        value={editForm.due_date}
                        onChange={(e) =>
                            onEditFormChange({
                                ...editForm,
                                due_date: e.target.value,
                            })
                        }
                        className="input-sega"
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => onUpdate(countdown.id)}
                            disabled={!editForm.title.trim() || !editForm.due_date}
                            className="btn-sega btn-sega--sm bg-primary text-white"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={onCancelEdit}
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
                            {countdown.title}
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
                            onClick={() => onToggleDetails(countdown.id)}
                            className="link-sega flex items-center gap-1"
                        >
                            <span className="text-base leading-none">
                                {isExpanded ? '\u2212' : '+'}
                            </span>
                            Details
                        </button>
                        <button
                            type="button"
                            onClick={() => onStartEdit(countdown)}
                            className="link-sega"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(countdown.id)}
                            className="font-mono text-xs uppercase tracking-widest text-danger underline-offset-2 hover:underline"
                            style={{ fontFamily: 'var(--font-jetbrains), JetBrains Mono, monospace' }}
                        >
                            Delete
                        </button>
                    </div>

                    {isExpanded && (
                        <div className="mt-4 border-t-2 border-ink pt-4">
                            <p className="font-sans text-[1.0625rem] leading-snug text-[#4B5563]">
                                {countdown.description || (
                                    <span className="italic opacity-60">No description</span>
                                )}
                            </p>
                            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                                Due{' '}
                                {new Date(countdown.due_date).toLocaleDateString('en-US', {
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
}
