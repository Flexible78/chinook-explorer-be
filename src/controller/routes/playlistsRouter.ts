import express, { Request, Response } from "express";
import { auth } from "../../middleware/auth.js";
// Импорты сервисов и моделей добавим позже, когда создадим их!

const playlistsRouter = express.Router();

playlistsRouter.get("/", auth("SALE", "SUPER_USER"), async (req: Request, res: Response) => {
    res.json({ message: "Тут будет список плейлистов из Supabase!" });
});

playlistsRouter.get("/:id", auth("SALE", "SUPER_USER"), async (req: Request, res: Response) => {
    res.json({ message: `Тут будет информация о плейлисте с ID: ${req.params.id}` });
});

export default playlistsRouter;
