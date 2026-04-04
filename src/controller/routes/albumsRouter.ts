import express, { type Request, type Response } from "express";
// import { auth } from "../../middleware/auth.js"; // ВРЕМЕННО ОТКЛЮЧИЛИ

const albumsRouter = express.Router();

albumsRouter.get("/", async (req: Request, res: Response) => {
    res.json({ message: "Тут будет список альбомов из Supabase!" });
});

albumsRouter.get("/:id", async (req: Request, res: Response) => {
    res.json({ message: `Тут будет информация об альбоме с ID: ${req.params.id}` });
});

export default albumsRouter;
