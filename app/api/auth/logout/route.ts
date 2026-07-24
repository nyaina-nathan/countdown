import { withErrorHandler } from "@/libs/errorHandler";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandler(
    async (_req: NextRequest): Promise<NextResponse> => {
        
        const response = NextResponse.json({ status: 204 });

        response.cookies.delete('user_jwt')

        return response;
    }
);
