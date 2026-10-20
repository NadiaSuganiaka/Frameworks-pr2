export function notFound(req, res, next) {
    console.log('4. notFound');
    const error = new Error(`Route ${req.method} ${req.originalUrl} was not found`);
    error.statusCode = 404;
    error.code = 'ROUTE_NOT_FOUND';
    next(error);
}
