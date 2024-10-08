import { Usuario } from "../user/user.models";

export interface LoginCredentials {
    email: string;
    contraseña: string;
}

export interface AuthResponse {
    token: string;
    // user: Usuario;
}
