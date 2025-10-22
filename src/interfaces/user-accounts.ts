import { UserRole } from "../types";


export interface NewUserDto {
    username: string;
    email: string;
    password: string;
    language: string;
    rol: UserRole;
    photoName: string;
    modulePermissions: number[];
}