import express, { type Request, type Response } from "express";
import db from "../../db.js";

const playlistsRouter = express.Router();

playlistsRouter.get("/", async (req: Request, res: Response) => {
    try {
        console.log("Запрос к БД: получаем плейлисты..."); // Исправили лог

        // Добавили кавычки "playlist", чтобы Knex понял, что это название таблицы
        const playlists = await db("playlist").select("*");

        // Отправляем готовый JSON на фронтенд
        res.json(playlists);
    } catch (error) {
        console.error("❌ Ошибка при получении плейлистов:", error); // Исправили лог
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

export default playlistsRouter;