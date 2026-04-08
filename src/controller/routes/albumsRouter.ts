import express, { type Request, type Response } from "express";
import db from "../../db.js";
import ServiceError from "../../errors/ServiceError.js";
import logger from "../../logger.js";
import {
    getPagination,
    parseCount,
    setPaginationHeaders,
} from "../../utils/pagination.js";

const albumsRouter = express.Router();

albumsRouter.get("/", async (req: Request, res: Response) => {
    try {
        logger.info("[DB] Fetching albums with artists...");
        const pagination = getPagination(req.query);

        const albumsQuery = db("album")
            .join("artist", "album.artist_id", "=", "artist.artist_id")
            .orderBy("album.album_id")
            .select(
                "album.album_id as id",
                "album.title as name",
                "artist.name as artistName",
            );

        if (pagination) {
            const totalResult = await db("album")
                .count({ count: "*" })
                .first();
            setPaginationHeaders(res, parseCount(totalResult?.count), pagination);
            albumsQuery.limit(pagination.limit).offset(pagination.offset);
        }

        const albums = await albumsQuery;
        res.json(albums);
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(error.code).json({ error: error.message });
            return;
        }
        logger.error(error, "Error fetching albums");
        res.status(500).json({ error: "Internal server error" });
    }
});

albumsRouter.get("/:id/tracks", async (req: Request, res: Response) => {
    try {
        const albumId = req.params.id;
        logger.info(`[DB] Fetching tracks for album ${albumId}...`);
        const pagination = getPagination(req.query);

        const tracksQuery = db("track")
            .join("genre", "track.genre_id", "=", "genre.genre_id")
            .join("media_type", "track.media_type_id", "=", "media_type.media_type_id")
            .where("track.album_id", albumId)
            .orderBy("track.track_id")
            .select(
                "track.name as trackName",
                "genre.name as genreName",
                "media_type.name as mediaTypeName",
            );

        if (pagination) {
            const totalResult = await db("track")
                .where("track.album_id", albumId)
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
        logger.error(error, `Error fetching tracks for album ${req.params.id}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default albumsRouter;
