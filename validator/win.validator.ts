import { AppError } from "@/libs/AppError";
import { CreateWinPayload, UpdateWinPayload } from "@/types/win.types";

const ROUTE = '/api/wins';

export interface PaginationParams {
    page: number;
    perPage: number;
    skip: number;
    take: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 100;

const parsePositiveInt = (value: string | null): number | null => {
    if (value === null) return null;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) return null;
    return parsed;
};

export const validateCreateWinPayload = (payload: CreateWinPayload): void => {
    if (payload.title == null || !payload.title.trim()) {
        throw new AppError('Missing title in the request body', 'BAD REQUEST', 400, ROUTE);
    }
};

export const validateUpdateWinPayload = (payload: UpdateWinPayload): void => {
    const hasFields = payload.title !== undefined || payload.description !== undefined;
    if (!hasFields) {
        throw new AppError('No fields provided to update. Provide at least one of: title, description', 'BAD REQUEST', 400, `${ROUTE}/[id]`);
    }
    if (payload.title !== undefined && !payload.title.trim()) {
        throw new AppError('title cannot be empty', 'BAD REQUEST', 400, `${ROUTE}/[id]`);
    }
};

export const parsePaginationParams = (searchParams: URLSearchParams): PaginationParams => {
    const page = parsePositiveInt(searchParams.get('page')) ?? DEFAULT_PAGE;

    let perPage = parsePositiveInt(searchParams.get('perPage')) ?? DEFAULT_PER_PAGE;
    if (perPage > MAX_PER_PAGE) perPage = DEFAULT_PER_PAGE;

    return {
        page,
        perPage,
        skip: (page - 1) * perPage,
        take: perPage,
    };
};
