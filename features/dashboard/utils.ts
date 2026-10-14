import { CountdownFormState, WinFormState } from './types';

export const WINS_PER_PAGE = 10;

export const emptyCountdownForm = (): CountdownFormState => ({
    title: '',
    description: '',
    due_date: '',
});

export const emptyWinForm = (): WinFormState => ({
    title: '',
    description: '',
});

export const getTimeRemaining = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes, expired: false };
};

export const formatDateTimeLocal = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
