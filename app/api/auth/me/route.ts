import { AppError } from "@/libs/AppError";
import { withErrorHandler } from "@/libs/errorHandler";
import { deleteAccount, getUserById } from "@/service/auth.service";
import { NextRequest, NextResponse } from "next/server";

export const GET = withErrorHandler(
    async (req: NextRequest): Promise<NextResponse> => {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/auth/me');
        }

        const user = await getUserById(userId);

        return NextResponse.json(user, { status: 200 });
    }
);

export const DELETE = withErrorHandler(
    async (req: NextRequest): Promise<NextResponse> => {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            throw new AppError('Unauthorized', 'UNAUTHORIZED', 401, '/api/auth/me');
        }

        await deleteAccount(userId);

        const response = NextResponse.json(null, { status: 204 });

        response.cookies.set('user_jwt', '', {
            httpOnly: true,
            maxAge: 0,
            secure: process.env.NODE_ENV == 'production',
            sameSite: "lax",
        });

        return response;
    }
);
