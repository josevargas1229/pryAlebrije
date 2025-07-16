import { Usuario } from "../user/user.models";

export interface LoginCredentials {
    email: string;
    contraseña: string;
}

export interface AuthResponse {
    token: string;
    userId?: number;
    tipo?: number | string;
    verified?: boolean;
    redirect_to?: string; 
}
