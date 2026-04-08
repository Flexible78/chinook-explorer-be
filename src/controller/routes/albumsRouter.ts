import express, { type Request, type Response } from "express";
import db from "../../db.js";
import logger from "../../logger.js";

const albumsRouter = express.Router();

albumsRouter.get("/", async (req: Request, res: Response) => {
    try {
        logger.info("[DB] Fetching albums with artists...");

        const albums = await db("album")
            .join("artist", "album.artist_id", "=", "artist.artist_id")
            .select(
                "album.album_id as id",
                "album.title as name",
                "artist.name as artistName",
            );

        res.json(albums);
    } catch (error) {
        logger.error(error, "Error fetching albums");
        res.status(500).json({ error: "Internal server error" });
    }
});

albumsRouter.get("/:id/tracks", async (req: Request, res: Response) => {
    try {
        const albumId = req.params.id;
        logger.info(`[DB] Fetching tracks for album ${albumId}...`);

        const tracks = await db("track")
            .join("genre", "track.genre_id", "=", "genre.genre_id")
            .join("media_type", "track.media_type_id", "=", "media_type.media_type_id")
            .where("track.album_id", albumId)
            .select(
                "track.name as trackName",
                "genre.name as genreName",
                "media_type.name as mediaTypeName",
            );

        res.json(tracks);
    } catch (error) {
        logger.error(error, `Error fetching tracks for album ${req.params.id}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default albumsRouter;
