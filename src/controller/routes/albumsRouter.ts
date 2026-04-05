import express, { type Request, type Response } from "express";
import db from "../../db.js";

const albumsRouter = express.Router();

// Маршрут для получения всех альбомов (с именами артистов по ТЗ)
albumsRouter.get("/", async (req: Request, res: Response) => {
    try {
        console.log("Запрос к БД: получаем альбомы с артистами...");

        // Магия JOIN: склеиваем Альбомы и Артистов по их ID
        const albums = await db("album")
            .join("artist", "album.artist_id", "=", "artist.artist_id")
            .select(
                "album.album_id as id",
                "album.title as albumName",
                "artist.name as artistName"  // Берем имя артиста по ТЗ!
            );

        res.json(albums);
    } catch (error) {
        console.error("❌ Ошибка при получении альбомов:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

// Экспортируем роутер, чтобы app.ts мог его использовать
export default albumsRouter;