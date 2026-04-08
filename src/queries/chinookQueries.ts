import db from "../db.js";
import type { AlbumDto, TrackDto } from "../dto/chinook.js";

function selectTrackDto() {
    return {
        name: "track.name",
        genreName: "genre.name",
        mediaTypeName: "media_type.name",
    } as const;
}

function withTrackMetadata(query: ReturnType<typeof db>) {
    return query
        .join("genre", "track.genre_id", "=", "genre.genre_id")
        .join("media_type", "track.media_type_id", "=", "media_type.media_type_id");
}

function invoiceTrackScope(customerId: string, invoiceId: string) {
    return db("invoice_line")
        .join("invoice", "invoice_line.invoice_id", "=", "invoice.invoice_id")
        .where("invoice.customer_id", customerId)
        .andWhere("invoice.invoice_id", invoiceId);
}

export function buildAlbumsQuery() {
    return db("album")
        .join("artist", "album.artist_id", "=", "artist.artist_id")
        .orderBy("album.album_id")
        .select<AlbumDto[]>({
            id: "album.album_id",
            name: "album.title",
            artistName: "artist.name",
        });
}

export function buildAlbumTracksQuery(albumId: string) {
    return withTrackMetadata(
        db("track")
            .where("track.album_id", albumId)
            .orderBy("track.track_id"),
    ).select<TrackDto[]>(selectTrackDto());
}

export function buildAlbumTracksCountQuery(albumId: string) {
    return db("track")
        .where("track.album_id", albumId)
        .count({ count: "*" });
}

export function buildPlaylistTracksQuery(playlistId: string) {
    return withTrackMetadata(
        db("playlist_track")
            .join("track", "playlist_track.track_id", "=", "track.track_id")
            .where("playlist_track.playlist_id", playlistId)
            .orderBy("playlist_track.track_id"),
    ).select<TrackDto[]>(selectTrackDto());
}

export function buildPlaylistTracksCountQuery(playlistId: string) {
    return db("playlist_track")
        .where("playlist_id", playlistId)
        .count({ count: "*" });
}

export function buildInvoiceTracksQuery(customerId: string, invoiceId: string) {
    return withTrackMetadata(
        invoiceTrackScope(customerId, invoiceId)
            .join("track", "invoice_line.track_id", "=", "track.track_id")
            .orderBy("invoice_line.invoice_line_id"),
    ).select<TrackDto[]>(selectTrackDto());
}

export function buildInvoiceTracksCountQuery(customerId: string, invoiceId: string) {
    return invoiceTrackScope(customerId, invoiceId)
        .count({ count: "*" });
}
