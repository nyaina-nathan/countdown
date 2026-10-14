'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthForm } from './auth-form';
import { AuthModeSwitch } from './auth-mode-switch';
import { AuthFormValues, Mode } from './types';
import { validateAuthForm } from './validation';

const emptyValues = (): AuthFormValues => ({
    email: '',
    username: '',
    password: '',
});

export function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>('login');
    const [values, setValues] = useState<AuthFormValues>(emptyValues());
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const switchMode = (next: Mode) => {
        if (next === mode) return;
        setMode(next);
        setValues(emptyValues());
        setError(null);
    };

    const handleChange = (field: keyof AuthFormValues, value: string) => {
        setValues((v) => ({ ...v, [field]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const clientError = validateAuthForm(values, mode);
        if (clientError) {
            setError(clientError);
            return;
        }

        setLoading(true);
        try {
            const body =
                mode === 'login'
                    ? { email: values.email, password: values.password }
                    : {
                        email: values.email,
                        username: values.username,
                        password: values.password,
                    };

            const res = await fetch(`/api/auth/${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                let message = 'Something went wrong. Please try again.';
                try {
                    const data = await res.json();
                    if (data?.message) message = data.message;
                    else if (data?.title) message = data.title;
                } catch {
                    // ignore JSON parse errors, use default message
                }
                setError(message);
                return;
            }

            router.push('/dashboard');
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const isRegister = mode === 'register';

    return (
        <main className="flex flex-1 items-center justify-center px-4 py-12">
            <div
                className="card-sega w-full max-w-md"
                style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1)' }}
            >
                <h1 className="mb-8 text-center font-sans text-[2.1875rem] leading-none">
                    {isRegister ? 'Create account' : 'Log in'}
                </h1>

                <AuthForm
                    mode={mode}
                    values={values}
                    error={error}
                    loading={loading}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                />

                <AuthModeSwitch mode={mode} onSwitch={switchMode} />
            </div>
        </main>
    );
}
