import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import logger from "../../logger.js";
import { USERS } from "../../data/users.js"; // <-- Импортируем нашу базу

const accountsRouter = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "pass21";

accountsRouter.post("/login", (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        logger.info(`Login attempt for email: ${email}`);

        // Ищем в нашей новой "базе"
        const user = USERS.find(u => u.email === email && u.password === password);

        if (!user) {
            logger.warn(`Failed login for: ${email}`);
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const token = jwt.sign(
            { email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        logger.info(`User logged in: ${user.email} (Role: ${user.role})`);
        res.json({
            message: "Login successful",
            token,
            role: user.role,
            userName: user.name
        });
    } catch (error) {
        logger.error(error, "Login error");
        res.status(500).json({ error: "Internal server error" });
    }
});

export default accountsRouter;