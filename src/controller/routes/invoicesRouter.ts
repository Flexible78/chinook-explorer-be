import express, { type Request, type Response } from "express";
import db from "../../db.js";
import logger from "../../logger.js";

const invoicesRouter = express.Router();

invoicesRouter.get("/:id/tracks", async (req: Request, res: Response) => {
    try {
        logger.info(`[DB] Fetching tracks for invoice ${req.params.id}...`);
        const tracks = await db("invoice_line")
            .join("track", "invoice_line.track_id", "=", "track.track_id")
            .join("genre", "track.genre_id", "=", "genre.genre_id")
            .where("invoice_line.invoice_id", req.params.id)
            .select(
                "track.name as trackName", "genre.name as genreName",
                "invoice_line.unit_price as unitPrice"
            );
        res.json(tracks);
    } catch (error) {
        logger.error(error, "Error fetching tracks");
        res.status(500).json({ error: "Internal server error" });
    }
});

export default invoicesRouter;