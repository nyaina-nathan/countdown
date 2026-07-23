import { AppError } from "@/libs/AppError";
import { withErrorHandler } from "@/libs/errorHandler";
import { loginUser } from "@/service/auth.service";
import { LoginPayload } from "@/types/auth.types";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandler(
    async (req : NextRequest)  : Promise<NextResponse> => {
        let userBody : null | LoginPayload;
        try {
            userBody = await req.json()
        } catch {
            throw new AppError(
                'Missing request body. Please provide these fields: email, password',
                'BAD REQUEST',
                400,
                '/api/auth/login'
            )
        }

        const jwtToken = await loginUser(userBody as LoginPayload);

        const response = NextResponse.json({
            message : 'Logged in successfully'
        },{
            status : 200
        });

        response.cookies.set('user_jwt', jwtToken , {
            httpOnly : true,
            maxAge : 60 * 60 * 24,
            secure: process.env.NODE_ENV == 'production',
            sameSite : "lax"
        } );

        return response;
    }
)
