'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'register';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const switchMode = (next: Mode) => {
        if (next === mode) return;
        setMode(next);
        setEmail('');
        setUsername('');
        setPassword('');
        setError(null);
    };

    const validate = (): string | null => {
        if (!email) return 'Email is required';
        if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email';
        if (mode === 'register' && !username.trim()) return 'Username is required';
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        return null;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const clientError = validate();
        if (clientError) {
            setError(clientError);
            return;
        }

        setLoading(true);
        try {
            const body =
                mode === 'login'
                    ? { email, password }
                    : { email, username, password };

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

            router.push('/');
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const isRegister = mode === 'register';

    return (
        <main className="relative flex min-h-screen items-center justify-center bg-[#F7F6F3] px-4 py-24 font-sans">
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 overflow-hidden"
            >
                <div
                    className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] animate-pulse rounded-full"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)',
                        animationDuration: '25s',
                    }}
                />
            </div>

            <div
                className="w-full max-w-md animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)] rounded-xl border border-[#EAEAEA] bg-white p-8"
            >
                <h1 className="mb-8 text-center font-serif text-3xl tracking-[-0.02em] leading-[1.1] text-[#111111]">
                    {isRegister ? 'Create account' : 'Log in'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="space-y-1.5">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[#787774]"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                            autoComplete="email"
                            placeholder="you@example.com"
                            className="w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2.5 text-[#111111] placeholder:text-[#787774] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                        />
                    </div>

                    {isRegister && (
                        <div className="space-y-1.5">
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-[#787774]"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                placeholder="yourname"
                                className="w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2.5 text-[#111111] placeholder:text-[#787774] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-[#787774]"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                            placeholder={String.fromCharCode(0x2022).repeat(8)}
                            className="w-full rounded-md border border-[#EAEAEA] bg-white px-3 py-2.5 text-[#111111] placeholder:text-[#787774] focus:border-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                        />
                    </div>

                    {error && (
                        <p className="rounded-md bg-[#FDEBEC] px-3 py-2 text-sm text-[#9F2F2D]">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#333333] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? isRegister
                                ? 'Creating account\u2026'
                                : 'Logging in\u2026'
                            : isRegister
                                ? 'Sign up'
                                : 'Log in'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-[#787774]">
                    {isRegister ? (
                        <>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                className="font-medium text-[#111111] underline-offset-2 hover:underline"
                            >
                                Log in
                            </button>
                        </>
                    ) : (
                        <>
                            Don&apos;t have an account?{' '}
                            <button
                                type="button"
                                onClick={() => switchMode('register')}
                                className="font-medium text-[#111111] underline-offset-2 hover:underline"
                            >
                                Sign up
                            </button>
                        </>
                    )}
                </p>
            </div>
        </main>
    );
};

export default LoginPage;
