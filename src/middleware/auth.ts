// ДОБАВИЛИ слово type перед Request, Response и NextFunction
import express, { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../logger.js";

// Берем тот же секрет, что и в accountsRouter
const SECRET_KEY = process.env.JWT_SECRET || "pass21";

// Расширяем стандартный Request, чтобы TypeScript разрешил нам сохранить туда данные юзера
export interface AuthRequest extends Request {
    user?: string | jwt.JwtPayload;
}

// Наша функция-охранник
export const authorize = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        try {
            // 1. Проверяем токен в заголовках
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                logger.warn("Access denied: No token provided");
                res.status(401).json({ error: "Unauthorized: No token provided" });
                return;
            }

            // Достаем сам токен
            const token = authHeader.split(" ")[1];

            // 2. Расшифровываем
            const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
            req.user = decoded;

            const userRole = decoded.role;

            // 3. Проверяем роль
            if (userRole === "SUPER_USER" || allowedRoles.includes(userRole)) {
                next(); // Пропускаем дальше
            } else {
                logger.warn(`Access denied: Role ${userRole} is not allowed`);
                res.status(403).json({ error: "Forbidden: Access denied for your role" });
            }
        } catch (error) {
            logger.error(error, "Invalid token");
            res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
    };
};