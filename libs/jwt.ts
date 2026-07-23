import { JWTPayload, jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export const generateToken = async(userId : string ) => {
    return await new SignJWT()
    .setProtectedHeader({alg : 'HS256'})
    .setIssuedAt()
    .setSubject(userId)
    .setExpirationTime('24h')
    .sign(secret);
}

export const verifyAndGetUserId = async (token : string) => {
    try {
        const verified = await jwtVerify(token, secret);
        return verified.payload.sub;
    } catch (err) {
        return null
    }
}