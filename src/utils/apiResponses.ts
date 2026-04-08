import type { Response } from "express";
import type {
    ActionResponseDto,
    ApiResponse,
    ErrorResponseDto,
    PaginatedApiResponse,
} from "../dto/api.js";
import type { Pagination } from "./pagination.js";
import { buildPaginationDto, setPaginationHeaders } from "./pagination.js";

export function sendData<T>(res: Response, data: T, status = 200) {
    const body: ApiResponse<T> = { data };
    res.status(status).json(body);
}

export function sendPaginatedData<T>(
    res: Response,
    data: T[],
    totalCount: number,
    pagination: Pagination | null,
    status = 200,
) {
    const paginationDto = buildPaginationDto(totalCount, data.length, pagination);
    if (pagination) {
        setPaginationHeaders(res, totalCount, pagination);
    }
    const body: PaginatedApiResponse<T> = {
        data,
        pagination: paginationDto,
    };
    res.status(status).json(body);
}

export function sendSuccess(res: Response, status = 200) {
    const body: ApiResponse<ActionResponseDto> = {
        data: { success: true },
    };
    res.status(status).json(body);
}

export function sendError(res: Response, status: number, message: string) {
    const body: ErrorResponseDto = {
        error: {
            message,
        },
    };
    res.status(status).json(body);
}
