import express, { type Request, type Response } from "express";
import db from "../../db.js"; // Обязательно подключаем базу!

const albumsRouter = express.Router();

// Маршрут для получения всех альбомов
albumsRouter.get("/", async (req: Request, res: Response) => {
    try {
        console.log("Запрос к БД: получаем все альбомы...");

        // Стучимся в таблицу album
        const albums = await db("album").select("*");

        res.json(albums);
    } catch (error) {
        console.error("❌ Ошибка при получении альбомов:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

// Маршрут для получения ОДНОГО альбома по ID (бонус!)
albumsRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const albumId = req.params.id;
        console.log(`Запрос к БД: получаем альбом с ID ${albumId}...`);

        // Ищем конкретный альбом. Метод .first() берет один объект, а не массив
        const album = await db("album").where("album_id", albumId).first();

        if (!album) {
            // Если база вернула пустоту, значит такого альбома нет (ошибка 404)
            res.status(404).json({ error: "Альбом не найден" });
            return;
        }

        res.json(album);
    } catch (error) {
        console.error(`❌ Ошибка при получении альбома ${req.params.id}:`, error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

export default albumsRouter;