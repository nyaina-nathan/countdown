export interface Countdown {
    id: string;
    title: string;
    description: string | null;
    due_date: string;
}

export interface CountdownFormState {
    title: string;
    description: string;
    due_date: string;
}

export interface Win {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
}

export interface WinFormState {
    title: string;
    description: string;
}

export interface WinsMeta {
    page: number;
    perPage: number;
    total: number;
    totalPage: number;
}
