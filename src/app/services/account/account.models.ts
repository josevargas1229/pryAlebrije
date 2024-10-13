export interface Cuenta {
    id: number;
    user_id: number;
    nombre_usuario: string;
    contraseña_hash: string;
    fecha_creacion: Date;
    ultimo_acceso?: Date;
    configuracion_2fa?: boolean;
    bloqueada?: boolean;
}
export interface HistorialPass {
    id: number;
    account_id: number;
    contraseña_hash: string;
    fecha_cambio: Date;
}

export interface IntentoFallido {
    id: number;
    user_id: number;
    fecha: Date;
    ip: string;
}