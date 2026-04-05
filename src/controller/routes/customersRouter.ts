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
// 1. Маршрут: Получить Агента по продажам для конкретного клиента
customersRouter.get("/:id/agent", async (req: Request, res: Response) => {
    try {
        const customerId = req.params.id;
        console.log(`Запрос к БД: ищем агента для клиента ${customerId}...`);

        // Склеиваем Клиента и Сотрудника. Используем .first(), так как агент только один!
        const agent = await db("customer")
            .join("employee", "customer.support_rep_id", "=", "employee.employee_id")
            .where("customer.customer_id", customerId)
            .select(
                "employee.first_name as firstName",
                "employee.last_name as lastName",
                "employee.birth_date as birthDate",
                "employee.hire_date as hireDate",
                "employee.city",
                "employee.country",
                "employee.email"
            )
            .first();

        if (!agent) {
            res.status(404).json({ error: "Агент не найден" });
            return;
        }

        res.json(agent);
    } catch (error) {
        console.error(`❌ Ошибка при получении агента для клиента ${req.params.id}:`, error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

// 2. Маршрут: Получить все Счета (Invoices) конкретного клиента
customersRouter.get("/:id/invoices", async (req: Request, res: Response) => {
    try {
        const customerId = req.params.id;
        console.log(`Запрос к БД: ищем счета клиента ${customerId}...`);

        // Тут JOIN не нужен, счета просто лежат в таблице invoice с нужным customer_id
        const invoices = await db("invoice")
            .where("customer_id", customerId)
            .select("*");

        res.json(invoices);
    } catch (error) {
        console.error(`❌ Ошибка при получении счетов клиента ${req.params.id}:`, error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});
export default customersRouter;