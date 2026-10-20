import { Router } from 'express';

const router = Router();
const events = [{ id: 1, title: 'JavaScript Meetup', date: '2026-10-10' }];
let nextId = 2;

function httpError(statusCode, message) {
    return Object.assign(new Error(message), { statusCode });
}

router.use((req, res, next) => {
    console.log('3. router');
    next();
});

router.get('/error/test', (req, res, next) => {
    next(new Error('Test error'));
});

router.get('/', (req, res) => res.json(events));

router.param('id', (req, res, next, id) => {
    const event = events.find(item => String(item.id) === id);
    if (!event) return next(httpError(404, 'Event not found'));
    req.event = event;
    next();
});

router.get('/:id', (req, res) => res.json(req.event));

function validateEvent(req, res, next) {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return next(httpError(400, 'Request body must be a JSON object'));
    }
    const fields = ['title', 'date'];
    if (req.method === 'POST' && fields.some(field => !(field in body))) {
        return next(httpError(400, "The 'title' and 'date' fields are mandatory"));
    }
    if (!fields.some(field => field in body)) {
        return next(httpError(400, 'Provide title or date to update'));
    }
    req.eventChanges = {};
    for (const field of fields) {
        if (!(field in body)) continue;
        if (typeof body[field] !== 'string' || !body[field].trim()) {
            return next(httpError(400, `${field} must be a non-empty string`));
        }
        req.eventChanges[field] = body[field].trim();
    }
    next();
}

router.post('/', validateEvent, (req, res) => {
    const event = { id: nextId++, ...req.eventChanges };
    events.push(event);
    res.status(201).location(`/api/events/${event.id}`).json(event);
});

router.patch('/:id', validateEvent, (req, res) => {
    Object.assign(req.event, req.eventChanges);
    res.json(req.event);
});

router.delete('/:id', (req, res) => {
    events.splice(events.indexOf(req.event), 1);
    res.status(204).end();
});

export default router;
