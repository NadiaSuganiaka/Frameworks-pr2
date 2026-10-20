export function notFound(req, res, next) {
    console.log('4. notFound');
    const error = new Error('Route not found');
    error.statusCode = 404;
    next(error);
}
