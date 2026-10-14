import { type FormEvent } from 'react';
import { CountdownFormState } from '../types';

interface CountdownCreateFormProps {
    form: CountdownFormState;
    onChange: (form: CountdownFormState) => void;
    onSubmit: (e: FormEvent) => void;
}

export function CountdownCreateForm({
    form,
    onChange,
    onSubmit,
}: CountdownCreateFormProps) {
    return (
        <form
            onSubmit={onSubmit}
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
                        value={form.title}
                        onChange={(e) =>
                            onChange({ ...form, title: e.target.value })
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
                        value={form.description}
                        onChange={(e) =>
                            onChange({ ...form, description: e.target.value })
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
                        value={form.due_date}
                        onChange={(e) =>
                            onChange({ ...form, due_date: e.target.value })
                        }
                        className="input-sega"
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={!form.title.trim() || !form.due_date}
                className="btn-sega mt-6 bg-primary text-white"
            >
                Create countdown
            </button>
        </form>
    );
}
