export type UserRole = "SUPER_USER" | "SALE" | "USER";

export interface Users {
    email: string;
    password: string;
    role: UserRole;
    name: string;
}

export const USERS: Users[] = [
    {
        email: "admin@tel-ran.com",
        password: "123",
        role: "SUPER_USER",
        name: "Administrator"
    },
    {
        email: "sale@tel-ran.com",
        password: "123",
        role: "SALE",
        name: "Sales Representative"
    },
    {
        email: "user@tel-ran.com",
        password: "123",
        role: "USER",
        name: "Regular User"
    },
    // Add test users here if you need to verify access-control scenarios
    {
        email: "test@test.com",
        password: "123",
        role: "USER",
        name: "Test User"
    }
];
