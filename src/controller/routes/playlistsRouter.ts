import express, { type Request, type Response } from "express";
// import { auth } from "../../middleware/auth.js"; // ВРЕМЕННО ОТКЛЮЧИЛИ

const playlistsRouter = express.Router();

playlistsRouter.get("/", async (req: Request, res: Response) => {
    res.json({ message: "Тут будет список плейлистов из Supabase!" });
});

playlistsRouter.get("/:id", async (req: Request, res: Response) => {
    res.json({ message: `Тут будет информация о плейлисте с ID: ${req.params.id}` });
});

export default playlistsRouter;
