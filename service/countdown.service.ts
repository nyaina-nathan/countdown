import { AppError } from "@/libs/AppError";
import { prisma } from "@/libs/prisma";
import { CreateCountdownPayload, UpdateCountdownPayload } from "@/types/countdown.types";
import { validateCreateCountdownPayload, validateUpdateCountdownPayload } from "@/validator/countdown.validator";

const ROUTE = '/api/countdowns';

export const createCountdown = async (userId: string, payload: CreateCountdownPayload) => {
    validateCreateCountdownPayload(payload);

    const countdown = await prisma.countdowns.create({
        data: {
            id_user: userId,
            title: payload.title.trim(),
            description: payload.description?.trim() || null,
            due_date: new Date(payload.due_date),
        },
    });

    return countdown;
};

export const getUserCountdowns = async (userId: string) => {
    const countdowns = await prisma.countdowns.findMany({
        where: { id_user: userId },
        orderBy: { due_date: 'asc' },
    });

    return countdowns;
};

export const getCountdownById = async (userId: string, id: string) => {
    const countdown = await prisma.countdowns.findFirst({
        where: { id, id_user: userId },
    });

    if (!countdown) {
        throw new AppError('Countdown not found', 'NOT FOUND', 404, `${ROUTE}/[id]`);
    }

    return countdown;
};

export const updateCountdown = async (userId: string, id: string, payload: UpdateCountdownPayload) => {
    validateUpdateCountdownPayload(payload);

    const existing = await prisma.countdowns.findFirst({
        where: { id, id_user: userId },
    });

    if (!existing) {
        throw new AppError('Countdown not found', 'NOT FOUND', 404, `${ROUTE}/[id]`);
    }

    const countdown = await prisma.countdowns.update({
        where: { id },
        data: {
            ...(payload.title !== undefined && { title: payload.title.trim() }),
            ...(payload.description !== undefined && { description: payload.description?.trim() || null }),
            ...(payload.due_date !== undefined && { due_date: new Date(payload.due_date) }),
        },
    });

    return countdown;
};

export const deleteCountdown = async (userId: string, id: string) => {
    const existing = await prisma.countdowns.findFirst({
        where: { id, id_user: userId },
    });

    if (!existing) {
        throw new AppError('Countdown not found', 'NOT FOUND', 404, `${ROUTE}/[id]`);
    }

    await prisma.countdowns.delete({
        where: { id },
    });
};
