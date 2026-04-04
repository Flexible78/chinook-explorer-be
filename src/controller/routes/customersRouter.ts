import express, { type Request, type Response } from "express";
// import { auth } from "../../middleware/auth.js"; // Пока закомментировано, так как папки еще нет
import db from "../../db.js"; // Подключаем наш мост к БД (обязательно с .js на конце!)

const customersRouter = express.Router();

customersRouter.get("/", async (req: Request, res: Response) => {
    try {
        console.log("Запрос к БД: получаем клиентов...");

        // Магия Knex: он сам собирает SQL-запрос "SELECT * FROM customer" и выполняет его
        const customers = await db("customer").select("*");

        // Отправляем готовый JSON на фронтенд
        res.json(customers);
    } catch (error) {
        console.error("❌ Ошибка при получении клиентов:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

export default customersRouter;