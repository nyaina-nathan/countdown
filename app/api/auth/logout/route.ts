import { withErrorHandler } from "@/libs/errorHandler";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandler(
    async (_req: NextRequest): Promise<NextResponse> => {
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
