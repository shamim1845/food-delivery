export enum UserRole {
    CUSTOMER = "CUSTOMER",
    RESTAURANT = "RESTAURANT",
    DRIVER = "DRIVER",
    ADMIN = "ADMIN"
}


export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt: Date;
}

export interface HealthCheckResponse {
    status: string;
    timestamp: Date;
}