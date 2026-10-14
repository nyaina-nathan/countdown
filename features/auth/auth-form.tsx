import { type FormEvent } from 'react';
import { AuthFormValues, Mode } from './types';

interface AuthFormProps {
    mode: Mode;
    values: AuthFormValues;
    error: string | null;
    loading: boolean;
    onChange: (field: keyof AuthFormValues, value: string) => void;
    onSubmit: (e: FormEvent) => void;
}

export function AuthForm({
    mode,
    values,
    error,
    loading,
    onChange,
    onSubmit,
}: AuthFormProps) {
    const isRegister = mode === 'register';

    return (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div>
                <label htmlFor="email" className="label-sega">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => onChange('email', e.target.value)}
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
                        value={values.username}
                        onChange={(e) => onChange('username', e.target.value)}
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
                    value={values.password}
                    onChange={(e) => onChange('password', e.target.value)}
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
    );
}
