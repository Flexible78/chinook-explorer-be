// src/data/users.ts

export type UserRole = "SUPER_USER" | "SALE" | "USER";

export interface User {
    email: string;
    password: string;
    role: UserRole;
    name: string;
}

export const USERS: User[] = [
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
    // Можешь добавить тестовых юзеров для проверки ошибок доступа
    {
        email: "test@test.com",
        password: "123",
        role: "USER",
        name: "Test User"
    }
];