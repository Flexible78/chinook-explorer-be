import express, { type Request, type Response } from "express";
import db from "../../db.js";
import ServiceError from "../../errors/ServiceError.js";
import logger from "../../logger.js";
import {
    getPagination,
    parseCount,
    setPaginationHeaders,
} from "../../utils/pagination.js";

const playlistsRouter = express.Router();

playlistsRouter.get("/", async (req: Request, res: Response) => {
    try {
        logger.info("[DB] Fetching playlists...");
        const pagination = getPagination(req.query);

        const playlistsQuery = db("playlist")
            .orderBy("playlist_id")
            .select(
                "playlist_id as id",
                "name",
            );

        if (pagination) {
            const totalResult = await db("playlist")
                .count({ count: "*" })
                .first();
            setPaginationHeaders(res, parseCount(totalResult?.count), pagination);
            playlistsQuery.limit(pagination.limit).offset(pagination.offset);
        }

        const playlists = await playlistsQuery;
        res.json(playlists);
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(error.code).json({ error: error.message });
            return;
        }
        logger.error(error, "Error fetching playlists");
        res.status(500).json({ error: "Internal server error" });
    }
});

playlistsRouter.get("/:id/tracks", async (req: Request, res: Response) => {
    try {
        const playlistId = req.params.id;
        logger.info(`[DB] Fetching tracks for playlist ${playlistId}...`);
        const pagination = getPagination(req.query);

        const tracksQuery = db("playlist_track")
            .join("track", "playlist_track.track_id", "=", "track.track_id")
            .join("genre", "track.genre_id", "=", "genre.genre_id")
            .join("media_type", "track.media_type_id", "=", "media_type.media_type_id")
            .where("playlist_track.playlist_id", playlistId)
            .orderBy("playlist_track.track_id")
            .select(
                "track.name as trackName",
                "genre.name as genreName",
                "media_type.name as mediaTypeName",
            );

        if (pagination) {
            const totalResult = await db("playlist_track")
                .where("playlist_id", playlistId)
                .count({ count: "*" })
                .first();
            setPaginationHeaders(res, parseCount(totalResult?.count), pagination);
            tracksQuery.limit(pagination.limit).offset(pagination.offset);
        }

        const tracks = await tracksQuery;
        res.json(tracks);
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(error.code).json({ error: error.message });
            return;
        }
        logger.error(error, `Error fetching tracks for playlist ${req.params.id}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default playlistsRouter;
