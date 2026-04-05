import pino from "pino";

// Настраиваем красивый вывод логов в консоль
const logger = pino({
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true, // Делает текст цветным (ошибки красными, инфо синим)
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss", // Человекочитаемое время
            ignore: "pid,hostname", // Убираем лишний мусор из логов
        },
    },
});

export default logger;