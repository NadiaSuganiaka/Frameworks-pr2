import express from 'express';
import { randomUUID } from 'node:crypto';
import { readEvents, writeEvents } from './fileEventStore.js';
import { DataFileError } from './errors/DataFileError.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/events-from-file', async (req, res) => {
    try {
        const events = await readEvents();
        res.status(200).json(events);
    } catch (error) {
        if (error instanceof DataFileError) {
        console.error('[API Error]:', error.message, error.originalError);
        } else {
        console.error('[Server Error]:', error);
        }
        
        res.status(500).json({ message: 'Failed to read or save events' });
    }
});

// POST /api/events-from-file
app.post('/api/events-from-file', async (req, res) => {
    try {
        const { title, date } = req.body;

        if (!title || !date) {
            return res.status(400).json({ message: "The 'title' and 'date' fields are mandatory" });
        }

        const events = await readEvents();
        
        const newEvent = {
        id: randomUUID(),
        title,
        date,
        };

        events.push(newEvent);
        await writeEvents(events);

        res.status(201).json(newEvent);
    } catch (error) {
        if (error instanceof DataFileError) {
        console.error('[API Error]:', error.message, error.originalError);
        } else {
        console.error('[Server Error]:', error);
        }

        res.status(500).json({ message: 'Failed to read or save events' });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});