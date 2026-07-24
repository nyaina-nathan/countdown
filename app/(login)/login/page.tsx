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
        <main className="flex flex-1 items-center justify-center px-4 py-12">
            <div
                className="card-sega w-full max-w-md"
                style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1)' }}
            >
                <h1 className="mb-8 text-center font-sans text-[2.1875rem] leading-none">
                    {isRegister ? 'Create account' : 'Log in'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                        <label htmlFor="email" className="label-sega">
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
                            className="input-sega"
                        />
                    </div>

                    {isRegister && (
                        <div>
                            <label htmlFor="username" className="label-sega">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                placeholder="yourname"
                                className="input-sega"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="label-sega">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={isRegister ? 'new-password' : 'current-password'}
                            placeholder={String.fromCharCode(0x2022).repeat(8)}
                            className="input-sega"
                        />
                    </div>

                    {error && (
                        <p className="badge-sega bg-danger text-white text-sm w-full justify-center">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-sega w-full bg-primary text-white"
                    >
                        {loading
                            ? isRegister
                                ? 'Creating account...'
                                : 'Logging in...'
                            : isRegister
                                ? 'Sign up'
                                : 'Log in'}
                    </button>
                </form>

                <p className="mt-8 text-center font-mono text-xs uppercase tracking-widest text-[#6B7280]">
                    {isRegister ? (
                        <>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                className="link-sega"
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
                                className="link-sega"
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
