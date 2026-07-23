import { AppError } from "@/libs/AppError";
import { withErrorHandler } from "@/libs/errorHandler";
import { registerUser } from "@/service/auth.service";
import { RegisterPayload } from "@/types/auth.types";
import { NextRequest, NextResponse } from "next/server";

export const POST = withErrorHandler(
    async (req : NextRequest)  : Promise<NextResponse> => {
        let userBody : null | RegisterPayload;
        try {
            userBody = await req.json()
        } catch {
            throw new AppError(
                'Missing request body. Please provide these fields: email, username, password',
                'BAD REQUEST',
                400,
                '/api/auth/register'
            )
        }

        const jwtToken = await registerUser(userBody as RegisterPayload);

        const response = NextResponse.json({
            message : 'Account created'
        },{
            status : 201
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