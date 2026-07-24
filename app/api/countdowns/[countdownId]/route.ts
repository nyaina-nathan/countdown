import { AppError } from "@/libs/AppError";
import { withErrorHandler } from "@/libs/errorHandler";
import { getCountdownById, updateCountdown, deleteCountdown } from "@/service/countdown.service";
import { UpdateCountdownPayload } from "@/types/countdown.types";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ countdownId: string }> };

export const GET = withErrorHandler(
    async (req: NextRequest, { params }: RouteParams): Promise<NextResponse> => {

        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/countdowns/[id]');
        }

        const { countdownId } = await params;

        const countdown = await getCountdownById(userId, countdownId);

        return NextResponse.json({ data: countdown }, { status: 200 });
    }
);

export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: RouteParams): Promise<NextResponse> => {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/countdowns/[id]');
        }

        const { countdownId } = await params;

        let body: null | UpdateCountdownPayload;
        try {
            body = await req.json();
        } catch {
            throw new AppError(
                'Missing request body. Please provide at least one of: title, description, due_date',
                'BAD REQUEST',
                400,
                '/api/countdowns/[id]'
            );
        }

        const countdown = await updateCountdown(userId, countdownId, body as UpdateCountdownPayload);

        return NextResponse.json({ message: 'Countdown updated', data: countdown }, { status: 200 });
    }
);

export const DELETE = withErrorHandler(
    async (req: NextRequest, { params }: RouteParams): Promise<NextResponse> => {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/countdowns/[id]');
        }

        const { countdownId } = await params;

        await deleteCountdown(userId, countdownId);

        return NextResponse.json({ message: 'Countdown deleted' }, { status: 200 });
    }
);
