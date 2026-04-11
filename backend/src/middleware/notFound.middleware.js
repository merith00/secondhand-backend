export const notFoundMiddleware = (req, res, next) => {
    res.status(404).json({
        message: `Route nicht gefunden: ${req.method} ${req.originalUrl}`
    });
};