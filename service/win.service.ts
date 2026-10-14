import { AppError } from "@/libs/AppError";
import { prisma } from "@/libs/prisma";
import { CreateWinPayload, UpdateWinPayload } from "@/types/win.types";
import { validateCreateWinPayload, validateUpdateWinPayload } from "@/validator/win.validator";

const ROUTE = '/api/wins';

export const createWin = async (userId: string, payload: CreateWinPayload) => {
    validateCreateWinPayload(payload);

    const win = await prisma.wins.create({
        data: {
            id_user: userId,
            title: payload.title.trim(),
            description: payload.description?.trim() || null,
        },
    });

    return win;
};

export const getUserWins = async (userId: string, { skip, take }: { skip: number; take: number }) => {
    const [data, total] = await prisma.$transaction([
        prisma.wins.findMany({
            where: { id_user: userId },
            orderBy: { created_at: 'desc' },
            skip,
            take,
        }),
        prisma.wins.count({ where: { id_user: userId } }),
    ]);

    return { data, total };
};

export const getWinById = async (userId: string, id: string) => {
    const win = await prisma.wins.findFirst({
        where: { id, id_user: userId },
    });

    if (!win) {
        throw new AppError('Win not found', 'NOT FOUND', 404, `${ROUTE}/[id]`);
    }

    return win;
};

export const updateWin = async (userId: string, id: string, payload: UpdateWinPayload) => {
    validateUpdateWinPayload(payload);

    const existing = await prisma.wins.findFirst({
        where: { id, id_user: userId },
    });

    if (!existing) {
        throw new AppError('Win not found', 'NOT FOUND', 404, `${ROUTE}/[id]`);
    }

    const win = await prisma.wins.update({
        where: { id },
        data: {
            ...(payload.title !== undefined && { title: payload.title.trim() }),
            ...(payload.description !== undefined && { description: payload.description?.trim() || null }),
        },
    });

    return win;
};

export const deleteWin = async (userId: string, id: string) => {
    const existing = await prisma.wins.findFirst({
        where: { id, id_user: userId },
    });

    if (!existing) {
        throw new AppError('Win not found', 'NOT FOUND', 404, `${ROUTE}/[id]`);
    }

    await prisma.wins.delete({
        where: { id },
    });
};
