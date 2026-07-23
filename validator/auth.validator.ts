import { AppError } from "@/libs/AppError";
import { RegisterPayload } from "@/types/auth.types";

const REGISTER_ROUTE = '/api/auth/register';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegisterPayload = (
    user : RegisterPayload
) : void => {

    if(Object.keys(user).length == 0){
        throw new AppError(
            'Missing email in the request body',
            'BAD REQUEST',
            400,
            REGISTER_ROUTE
        )
    }

    if( user.email == null || !user.email.trim()){
        throw new AppError(
            'Missing email in the request body',
            'BAD REQUEST',
            400,
            REGISTER_ROUTE
        )
    }

    if(!EMAIL_REGEX.test(user.email.trim())){
        throw new AppError(
            'Invalid email format',
            'BAD REQUEST',
            400,
            REGISTER_ROUTE
        )
    }

    if(user.username == null || !user.username.trim()){
        throw new AppError(
            'Missing username in the request body',
            'BAD REQUEST',
            400,
            REGISTER_ROUTE
        )
    }

    if(user.password == null || !user.password.trim()){
        throw new AppError(
            'Missing password in the request body',
            'BAD REQUEST',
            400,
            REGISTER_ROUTE
        )
    }

    if(user.password.trim().length < 8){
        throw new AppError(
            'Password must be at least 8 characters',
            'BAD REQUEST',
            400,
            REGISTER_ROUTE
        )
    }
}