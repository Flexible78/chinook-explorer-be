# GET /albums Flow

This file explains what happens when the backend receives `GET /albums`.

## Step-by-step

| Step | File | Function | Code reference | Simple explanation |
| --- | --- | --- | --- | --- |
| 1 | `src/controller/app.ts` | app middleware chain | around lines 14-27 | Express starts the common middleware chain. For `/albums`, it runs `security_context`, then `auth("USER", accountingService.accountAdminRole)`, and only after that sends the request to `albumsRouter`. |
| 2 | `src/middleware/auth.ts` | `security_context` | around lines 13-29 | This middleware reads the `Authorization` header. If it starts with `Bearer `, it extracts the token and saves parsed values into `req.username`, `req.role`, and `req.auth_error`. |
| 3 | `src/middleware/auth.ts` | `parseToken` | around lines 31-54 | `parseToken` tries to validate the JWT and read data from it. On success, it gets the username from `payload.sub` and the role from `payload.role`. On failure, it stores the JWT error text in `auth_error`. |
| 4 | `src/utils/JwtUtil.ts` | `verify` | around lines 13-15 | `JwtUtil.verify(token)` calls `jwt.verify(token, getJwtSecret())`. This checks that the token signature is valid and that the token is not expired. |
| 5 | `src/config.ts` | `getJwtSecret` | around line 1 | The JWT secret comes from `process.env.JWT_SECRET`. If it is missing, the fallback value is `"pass21"`. |
| 6 | `src/middleware/auth.ts` | `auth` | around lines 56-68 | This middleware decides whether the request may continue. If the token is broken, it throws `JwtError`. If no user was found in the token, it throws `AuthenticationError`. If the role is not allowed, it throws `PermissionError`. Otherwise it calls `next()`. |
| 7 | `src/services/AccountingServiceImpl.ts` | `AccountingServiceMap` constructor | around lines 52-55 | There is no album service for `GET /albums`. This service is used here only to provide `accountAdminRole`, which is passed into `auth(...)` in `app.ts`. |
| 8 | `src/controller/routes/albumsRouter.ts` | `albumsRouter.get("/")` | around lines 13-17 | After auth passes, the route handler starts. It logs the request and reads pagination from query parameters by calling `getPagination(req.query)`. |
| 9 | `src/controller/routes/albumsRouter.ts` | `albumsRouter.get("/")` | around lines 18-25 | The handler builds a Knex query: start from table `album`, join table `artist`, sort by `album.album_id`, and select `id`, `name`, and `artistName`. |
| 10 | `src/utils/pagination.ts` | `getPagination` | around lines 23-43 | If the client sends `page` or `limit`, this helper validates them, calculates `offset`, and returns pagination data. If the values are invalid, it throws `ServiceError(400, ...)`. |
| 11 | `src/controller/routes/albumsRouter.ts` | `albumsRouter.get("/")` | around lines 27-32 | If pagination exists, the code runs one extra `count(*)` query on `album`, then sets pagination headers and adds `limit` and `offset` to the main albums query. |
| 12 | `src/utils/pagination.ts` | `setPaginationHeaders`, `parseCount` | around lines 45-60 | `parseCount` converts the DB count value to a number. `setPaginationHeaders` writes headers like `X-Total-Count`, `X-Page`, `X-Limit`, and `X-Total-Pages`. |
| 13 | `src/db.ts` | Knex `db` instance | around lines 5-11 | The `db` object is a Knex connection configured for PostgreSQL with `process.env.DATABASE_URL`. |
| 14 | `src/controller/routes/albumsRouter.ts` | `albumsRouter.get("/")` | around line 35 | `await albumsQuery` executes the SQL query through Knex. PostgreSQL returns the rows, and Knex gives them back as a JavaScript array of objects. |
| 15 | `src/controller/routes/albumsRouter.ts` | `albumsRouter.get("/")` | around line 36 | `res.json(albums)` sends the result back to the client as JSON. On success, Express returns status `200` by default. |
| 16 | `src/controller/routes/albumsRouter.ts` | `albumsRouter.get("/")` | around lines 37-43 | If something fails inside the route, the `catch` block sends an error response. `ServiceError` uses its own status code. Other errors return `500` with `{ "error": "Internal server error" }`. |
| 17 | `src/controller/app.ts` and `src/middleware/errorsHandling.ts` | `app.use(errorsHandler)` / `errorsHandler` | `app.ts` around line 30, `errorsHandling.ts` around lines 7-22 | If auth middleware throws an error before the route handler starts, Express passes it to the global error handler. That handler sends a JSON error response. |

## How token validation works

1. `security_context` reads `Authorization: Bearer <token>`.
2. It extracts the token string and passes it to `parseToken`.
3. `parseToken` calls `JwtUtil.verify(token)`.
4. `JwtUtil.verify` uses `jwt.verify(...)` with the secret from `getJwtSecret()`.
5. If the token is valid, the middleware stores `username` and `role` in the request object.
6. Then `auth(...)` checks that the user exists and that the role is allowed for `/albums`.

## How data is fetched from the DB

1. The route handler creates a Knex query with `db("album")`.
2. It joins the `artist` table so each album row also includes the artist name.
3. It selects only the fields needed by the client: `id`, `name`, `artistName`.
4. If pagination is requested, it runs one extra `count(*)` query and adds `limit` and `offset`.
5. `await albumsQuery` sends the SQL to PostgreSQL through the shared Knex connection from `src/db.ts`.
6. The resulting rows are returned as a JavaScript array and sent back with `res.json(albums)`.

## Service layer note

For `GET /albums`, there is no separate service layer that fetches album data. The route talks directly to the database through Knex. The only service-related part here is `accountingService.accountAdminRole`, which is used for the auth rule in `app.ts`.
