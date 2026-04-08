import express, { type Request, type Response } from "express";
import db from "../../db.js";
import logger from "../../logger.js";

const playlistsRouter = express.Router();

playlistsRouter.get("/", async (req: Request, res: Response) => {
    try {
        logger.info("[DB] Fetching playlists...");

        const playlists = await db("playlist").select(
            "playlist_id as id",
            "name",
        );

        res.json(playlists);
    } catch (error) {
        logger.error(error, "Error fetching playlists");
        res.status(500).json({ error: "Internal server error" });
    }
});

playlistsRouter.get("/:id/tracks", async (req: Request, res: Response) => {
    try {
        const playlistId = req.params.id;
        logger.info(`[DB] Fetching tracks for playlist ${playlistId}...`);

        const tracks = await db("playlist_track")
            .join("track", "playlist_track.track_id", "=", "track.track_id")
            .join("genre", "track.genre_id", "=", "genre.genre_id")
            .join("media_type", "track.media_type_id", "=", "media_type.media_type_id")
            .where("playlist_track.playlist_id", playlistId)
            .select(
                "track.name as trackName",
                "genre.name as genreName",
                "media_type.name as mediaTypeName",
            );

        res.json(tracks);
    } catch (error) {
        logger.error(error, `Error fetching tracks for playlist ${req.params.id}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default playlistsRouter;
