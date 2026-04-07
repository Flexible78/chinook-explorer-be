import pino from "pino";

// Configure readable console logging
const logger = pino({
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true, // Highlight log levels with colors
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss", // Format timestamps for readability
            ignore: "pid,hostname", // Hide noisy default fields
        },
    },
});

export default logger;
