import { AppError } from "@/libs/AppError";
import { withErrorHandler } from "@/libs/errorHandler";
import { createWin, getUserWins } from "@/service/win.service";
import { CreateWinPayload } from "@/types/win.types";
import { parsePaginationParams } from "@/validator/win.validator";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandler(
    async (req: NextRequest): Promise<NextResponse> => {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/wins');
        }

        let body: null | CreateWinPayload;
        try {
            body = await req.json();
        } catch {
            throw new AppError(
                'Missing request body. Please provide this field: title',
                'BAD REQUEST',
                400,
                '/api/wins'
            );
        }

        const win = await createWin(userId, body as CreateWinPayload);

        return NextResponse.json({
            message: 'Win created',
            data: win,
        }, { status: 201 });
    }
);

export const GET = withErrorHandler(
    async (req: NextRequest): Promise<NextResponse> => {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/wins');
        }

        const { page, perPage, skip, take } = parsePaginationParams(req.nextUrl.searchParams);

        const { data, total } = await getUserWins(userId, { skip, take });

        return NextResponse.json({
            meta: {
                page,
                perPage,
                total,
                totalPage: Math.ceil(total / perPage),
            },
            data,
        }, { status: 200 });
    }
);
