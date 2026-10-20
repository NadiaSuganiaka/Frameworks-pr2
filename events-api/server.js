import express from 'express';
import { randomUUID } from 'node:crypto';
import { readEvents, writeEvents } from './fileEventStore.js';
import eventsRouter from './routes/events.router.js';
import { requestId } from './middleware/requestId.js';
import { logger } from './middleware/logger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(requestId);
app.use(logger);
app.use(express.json());
app.use('/api/events', eventsRouter);

app.get('/api/events-from-file', async (req, res, next) => {
    try {
        res.json(await readEvents());
    } catch (error) {
        next(error);
    }
});

app.post('/api/events-from-file', async (req, res, next) => {
    try {
        const { title, date } = req.body ?? {};
        if (!title || !date) {
            return next(Object.assign(new Error("The 'title' and 'date' fields are mandatory"), { statusCode: 400 }));
        }
        const events = await readEvents();
        const newEvent = { id: randomUUID(), title, date };
        events.push(newEvent);
        await writeEvents(events);
        res.status(201).json(newEvent);
    } catch (error) {
        next(error);
    }
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
