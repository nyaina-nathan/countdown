import { AppError } from "@/libs/AppError";
import { withErrorHandler } from "@/libs/errorHandler";
import { getWinById, updateWin, deleteWin } from "@/service/win.service";
import { UpdateWinPayload } from "@/types/win.types";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ winId: string }> };

export const GET = withErrorHandler(
    async (req: NextRequest, { params }: RouteParams): Promise<NextResponse> => {

        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/wins/[id]');
        }

        const { winId } = await params;

        const win = await getWinById(userId, winId);

        return NextResponse.json({ data: win }, { status: 200 });
    }
);

export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: RouteParams): Promise<NextResponse> => {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/wins/[id]');
        }

        const { winId } = await params;

        let body: null | UpdateWinPayload;
        try {
            body = await req.json();
        } catch {
            throw new AppError(
                'Missing request body. Please provide at least one of: title, description',
                'BAD REQUEST',
                400,
                '/api/wins/[id]'
            );
        }

        const win = await updateWin(userId, winId, body as UpdateWinPayload);

        return NextResponse.json({ message: 'Win updated', data: win }, { status: 200 });
    }
);

export const DELETE = withErrorHandler(
    async (req: NextRequest, { params }: RouteParams): Promise<NextResponse> => {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/wins/[id]');
        }

        const { winId } = await params;

        await deleteWin(userId, winId);

        return NextResponse.json({ message: 'Win deleted' }, { status: 200 });
    }
);
