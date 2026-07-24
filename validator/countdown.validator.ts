import { AppError } from "@/libs/AppError";
import { CreateCountdownPayload, UpdateCountdownPayload } from "@/types/countdown.types";

const ROUTE = '/api/countdowns';

export const validateCreateCountdownPayload = (payload: CreateCountdownPayload): void => {
    if (payload.title == null || !payload.title.trim()) {
        throw new AppError('Missing title in the request body', 'BAD REQUEST', 400, ROUTE);
    }
    if (payload.due_date == null || !payload.due_date.trim()) {
        throw new AppError('Missing due_date in the request body', 'BAD REQUEST', 400, ROUTE);
    }
    const dueDate = new Date(payload.due_date);
    if (isNaN(dueDate.getTime())) {
        throw new AppError('Invalid due_date format. Must be a valid ISO date string', 'BAD REQUEST', 400, ROUTE);
    }
    if (dueDate <= new Date()) {
        throw new AppError('due_date must be in the future', 'BAD REQUEST', 400, ROUTE);
    }
};

export const validateUpdateCountdownPayload = (payload: UpdateCountdownPayload): void => {
    const hasFields = payload.title !== undefined || payload.description !== undefined || payload.due_date !== undefined;
    if (!hasFields) {
        throw new AppError('No fields provided to update. Provide at least one of: title, description, due_date', 'BAD REQUEST', 400, `${ROUTE}/[id]`);
    }
    if (payload.title !== undefined && !payload.title.trim()) {
        throw new AppError('title cannot be empty', 'BAD REQUEST', 400, `${ROUTE}/[id]`);
    }
    if (payload.due_date !== undefined) {
        if (!payload.due_date.trim()) {
            throw new AppError('due_date cannot be empty', 'BAD REQUEST', 400, `${ROUTE}/[id]`);
        }
        const dueDate = new Date(payload.due_date);
        if (isNaN(dueDate.getTime())) {
            throw new AppError('Invalid due_date format. Must be a valid ISO date string', 'BAD REQUEST', 400, `${ROUTE}/[id]`);
        }
        if (dueDate <= new Date()) {
            throw new AppError('due_date must be in the future', 'BAD REQUEST', 400, `${ROUTE}/[id]`);
        }
    }
};
