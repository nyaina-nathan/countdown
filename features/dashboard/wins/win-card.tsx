import { Win } from '../types';

interface WinCardProps {
    win: Win;
    index: number;
    onEdit: (win: Win) => void;
    onDelete: (id: string) => void;
}

export function WinCard({ win, index, onEdit, onDelete }: WinCardProps) {
    return (
        <div
            className="card-sega"
            style={{
                animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1)',
                animationDelay: `${index * 80}ms`,
                animationFillMode: 'both',
            }}
        >
            <div className="mb-4 flex items-start justify-between gap-4">
                <h3 className="font-sans text-[1.3125rem] leading-tight md:text-[1.6875rem]">
                    {win.title}
                </h3>
                <span className="badge-sega shrink-0 bg-secondary text-ink">
                    Win
                </span>
            </div>
            <p className="font-sans text-[1.0625rem] leading-snug text-[#4B5563]">
                {win.description || (
                    <span className="italic opacity-60">No description</span>
                )}
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                Won{' '}
                {new Date(win.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })}
            </p>
            <div className="mt-4 flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                <button
                    type="button"
                    onClick={() => onEdit(win)}
                    className="link-sega"
                >
                    Update
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(win.id)}
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
    );
}
