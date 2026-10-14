import { AuthFormValues, Mode } from './types';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateAuthForm = (
    values: AuthFormValues,
    mode: Mode,
): string | null => {
    if (!values.email) return 'Email is required';
    if (!EMAIL_REGEX.test(values.email)) return 'Please enter a valid email';
    if (mode === 'register' && !values.username.trim()) return 'Username is required';
    if (!values.password) return 'Password is required';
    if (values.password.length < 8) return 'Password must be at least 8 characters';
    return null;
};
