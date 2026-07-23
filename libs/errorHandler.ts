import { NextRequest, NextResponse } from "next/server"
import { AppError } from "./AppError";

type Handler = (req : NextRequest , ...ctx : unknown[]) => Promise<NextResponse>

export const withErrorHandler = (handler: Handler) => {
    return async (req: NextRequest, ...ctx: unknown[]) => {
        try {
            return await handler(req, ctx);
        } catch (e: unknown) {
            if (e instanceof AppError) {
                return NextResponse.json(
                    {
                        title: e.title,
                        status: e.status,
                        origin: e.origin,
                        timestamp: e.timestamp,
                        message: e.message,
                    },
                    {
                        status: e.status,
                    }
                );
            }

            if (e instanceof Error) {
                return NextResponse.json(
                    {
                        title: 'INTERNAL SERVER ERROR',
                        status: 500,
                        message: e.message,
                        timestamp: new Date().toISOString(),
                    },
                    {
                        status: 500,
                    }
                );
            }

            return NextResponse.json(
                {
                    title: 'INTERNAL SERVER ERROR',
                    status: 500,
                    message: 'An unknown error occurred',
                    timestamp: new Date().toISOString(),
                },
                {
                    status: 500,
                }
            );
        }
    };
};