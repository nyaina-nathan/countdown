import { AppError } from "@/libs/AppError";
import { generateToken } from "@/libs/jwt";
import { prisma } from "@/libs/prisma";
import { LoginPayload, RegisterPayload } from "@/types/auth.types";
import { validateLoginPayload, validateRegisterPayload } from "@/validator/auth.validator";
import * as bcrypt from 'bcrypt';

export const registerUser = async(
    registerPayload : RegisterPayload
) => {
    validateRegisterPayload(registerPayload);

    const isExisting = await prisma.users.findUnique({
        where : {
            email : registerPayload.email
        }
    });

    if(isExisting){
        throw new AppError(
            'This email already is already taken',
            'EMAIL CONFLICT',
            409,
            '/api/auth/register'
        )
    }

    const hashedPassword = bcrypt.hashSync(registerPayload.password, 12);

    const createdUser = await prisma.users.create({
        data : {
            email : registerPayload.email,
            username : registerPayload.username,
            password_hash : hashedPassword
        }
    });

    return await generateToken(createdUser.id);
}

export const loginUser = async(
    loginPayload : LoginPayload
) => {
    validateLoginPayload(loginPayload);

    const registeredUser = await prisma.users.findUnique({
        where : {
            email : loginPayload.email
        }
    });

    if(!registeredUser){
        throw new AppError(
            'No account found with this email',
            'NOT FOUND',
            404,
            '/api/auth/login'
        )
    }

    const isPasswordValid = bcrypt.compareSync(
        loginPayload.password,
        registeredUser.password_hash!
    )

    if(!isPasswordValid){
        throw new AppError(
            'Incorrect password',
            'UNAUTHORIZED',
            401,
            '/api/auth/login'
        )
    }

    return await generateToken(registeredUser.id);
}

export const getUserById = async (userId: string) => {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            created_at: true,
            updated_at: true,
        },
    });

    if (!user) {
        throw new AppError(
            'User not found',
            'NOT FOUND',
            404,
            '/api/auth/me'
        );
    }

    return user;
};

export const deleteAccount = async (userId: string) => {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true },
    });

    if (!user) {
        throw new AppError(
            'User not found',
            'NOT FOUND',
            404,
            '/api/auth/me'
        );
    }

    await prisma.users.delete({
        where: { id: userId },
    });
};