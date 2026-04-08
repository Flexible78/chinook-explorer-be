export const USER_ROLES = ["SUPER_USER", "SALE", "USER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type Account = {
    username: string;
    role: UserRole;
    password: string;
    name?: string;
};

export const isUserRole = (role: string): role is UserRole =>
    USER_ROLES.includes(role as UserRole);
