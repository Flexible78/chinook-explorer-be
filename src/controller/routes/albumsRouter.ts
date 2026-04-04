import express, { Request, Response } from "express";
import { auth } from "../../middleware/auth.js";
// Импорты сервисов и моделей добавим позже, когда создадим их!

const albumsRouter = express.Router();

albumsRouter.get("/", auth("SALE", "SUPER_USER"), async (req: Request, res: Response) => {
    res.json({ message: "Тут будет список альбомов из Supabase!" });
});

albumsRouter.get("/:id", auth("SALE", "SUPER_USER"), async (req: Request, res: Response) => {
    res.json({ message: `Тут будет информация об альбоме с ID: ${req.params.id}` });
});

export default albumsRouter;
