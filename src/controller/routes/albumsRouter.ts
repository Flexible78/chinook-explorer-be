import express, { type Request, type Response } from "express";
import db from "../../db.js";
import logger from "../../logger.js";

const albumsRouter = express.Router();

// Route to get all albums (with artist names per requirements)
albumsRouter.get("/", async (req: Request, res: Response) => {
    try {
        logger.info("DB request: fetching albums with artists...");

        // JOIN magic: joining Albums and Artists by their ID
        const albums = await db("album")
            .join("artist", "album.artist_id", "=", "artist.artist_id")
            .select(
                "album.album_id as id",
                "album.title as albumName",
                "artist.name as artistName"
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
        logger.info(`DB request: fetching tracks for album ${albumId}...`);

        // TRIPLE JOIN magic: assembling track, genre and media type
        const tracks = await db("track")
            .join("genre", "track.genre_id", "=", "genre.genre_id")
            .join("media_type", "track.media_type_id", "=", "media_type.media_type_id")
            .where("track.album_id", albumId)
            .select(
                "track.name as trackName",
                "genre.name as genreName",
                "media_type.name as mediaTypeName"
            );

        res.json(tracks);
    } catch (error) {
        logger.error(error, `Error fetching tracks for album ${req.params.id}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Export router for use in app.ts
export default albumsRouter;