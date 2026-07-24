import { AppError } from "@/libs/AppError";
import { withErrorHandler } from "@/libs/errorHandler";
import { createCountdown, getUserCountdowns } from "@/service/countdown.service";
import { CreateCountdownPayload } from "@/types/countdown.types";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandler(
    async (req: NextRequest): Promise<NextResponse> => {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/countdowns');
        }

        let body: null | CreateCountdownPayload;
        try {
            body = await req.json();
        } catch {
            throw new AppError(
                'Missing request body. Please provide these fields: title, due_date',
                'BAD REQUEST',
                400,
                '/api/countdowns'
            );
        }

        const countdown = await createCountdown(userId, body as CreateCountdownPayload);

        return NextResponse.json({
            message: 'Countdown created',
            data: countdown,
        }, { status: 201 });
    }
);

export const GET = withErrorHandler(
    async (req: NextRequest): Promise<NextResponse> => {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/countdowns');
        }

        const countdowns = await getUserCountdowns(userId);

        return NextResponse.json({
            data: countdowns,
        }, { status: 200 });
    }
);
