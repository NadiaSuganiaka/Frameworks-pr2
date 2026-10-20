export function errorHandler(err, req, res, next) {
    console.log('5. errorHandler');
    if (res.headersSent) return next(err);

    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        statusCode,
        message: statusCode >= 500 ? 'Internal server error' : err.message,
        requestId: req.requestId,
    });
}
