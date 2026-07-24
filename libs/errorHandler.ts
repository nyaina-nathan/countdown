import { NextRequest, NextResponse } from "next/server"
import { AppError } from "./AppError";

export function withErrorHandler<T extends (...args: any[]) => Promise<Response>>(
  handler: T
): T {
    return (async (...args: Parameters<T>) => {  
        try {
            return await handler(...args);
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
    }) as T;
};