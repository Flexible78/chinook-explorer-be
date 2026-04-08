export type PaginationDto = {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
};

export type ApiResponse<T> = {
    data: T;
};

export type PaginatedApiResponse<T> = {
    data: T[];
    pagination: PaginationDto;
};

export type ActionResponseDto = {
    success: true;
};

export type ErrorResponseDto = {
    error: {
        message: string;
    };
};
