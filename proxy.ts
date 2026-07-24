import { NextRequest, NextResponse } from "next/server";
import { verifyAndGetUserId } from "@/libs/jwt";

const proxy = async (req: NextRequest) => {
    const token = req.cookies.get('user_jwt')?.value;
    const userId = token ? await verifyAndGetUserId(token) : null;
    const { pathname } = req.nextUrl;

    if (pathname === '/login') {
        if (userId) {
            return NextResponse.redirect(new URL('/', req.url));
        }
        return NextResponse.next();
    }

    if (!userId) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', userId);

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
};

export default proxy;

export const config = {
    matcher: [
        '/((?!api/auth/(?:login|register)|_next/static|_next/image|favicon.ico|icon.png).*)',
    ],
};
