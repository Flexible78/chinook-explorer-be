declare global {
    namespace Express {
        interface Request {
            username?: string | null;
            role?: string | null;
            auth_error?: string | null;
        }
    }
}

export {};
