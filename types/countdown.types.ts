export interface CreateCountdownPayload {
    title: string;
    description?: string;
    due_date: string;
}

export interface UpdateCountdownPayload {
    title?: string;
    description?: string;
    due_date?: string;
}
