import { AppError } from "@/libs/AppError";
import { generateToken } from "@/libs/jwt";
import { prisma } from "@/libs/prisma";
import { RegisterPayload } from "@/types/auth.types";
import { validateRegisterPayload } from "@/validator/auth.validator";
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