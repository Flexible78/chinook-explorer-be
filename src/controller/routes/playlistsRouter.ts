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
// Маршрут для получения треков конкретного плейлиста по клику на "Details"
playlistsRouter.get("/:id/tracks", async (req: Request, res: Response) => {
    try {
        const playlistId = req.params.id;
        console.log(`Запрос к БД: получаем треки для плейлиста ${playlistId}...`);

        // Здесь мы начинаем с таблицы-посредника playlist_track
        const tracks = await db("playlist_track")
            .join("track", "playlist_track.track_id", "=", "track.track_id")
            .join("genre", "track.genre_id", "=", "genre.genre_id")
            .join("media_type", "track.media_type_id", "=", "media_type.media_type_id")
            .where("playlist_track.playlist_id", playlistId)
            .select(
                "track.name as trackName",
                "genre.name as genreName",
                "media_type.name as mediaTypeName"
            );

        res.json(tracks);
    } catch (error) {
        console.error(`❌ Ошибка при получении треков плейлиста ${req.params.id}:`, error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});
export default playlistsRouter;