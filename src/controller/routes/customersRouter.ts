import express, { Request, Response } from "express";
import { auth } from "../../middleware/auth.js";
// Импорты сервисов и моделей добавим позже, когда создадим их!

const customersRouter = express.Router();

// Обрати внимание, я уже вставил твою логику ролей в мидлвар auth!
customersRouter.get("/", auth("SALE", "SUPER_USER"), async (req: Request, res: Response) => {
    res.json({ message: "Тут будет список клиентов из Supabase!" });
});

export default customersRouter;