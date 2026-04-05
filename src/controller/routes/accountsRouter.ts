import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import logger from "../../logger.js";

const accountsRouter = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "pass21";

const users = [
    { email: "sale@test.com", password: "123", role: "SALE" },
    { email: "user@test.com", password: "123", role: "USER" },
    { email: "admin@test.com", password: "123", role: "SUPER_USER" }
];

accountsRouter.post("/login", (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        logger.info(`Login attempt for email: ${email}`);

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const token = jwt.sign(
            { email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        logger.error(error, "Login error");
        res.status(500).json({ error: "Internal server error" });
    }
});

export default accountsRouter;