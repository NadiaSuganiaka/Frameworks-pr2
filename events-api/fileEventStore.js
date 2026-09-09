import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DataFileError } from './errors/DataFileError.js';

const DATA_DIR = path.resolve('data');
const FILE_PATH = path.join(DATA_DIR, 'events.json');

export async function readEvents() {
    try {
        const data = await fs.readFile(FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new DataFileError('Failed to read event file', error);
    }
}

export async function writeEvents(events) {
    const tempPath = path.join(DATA_DIR, `temp_events_${randomUUID()}.json`);

    try {
        await fs.mkdir(DATA_DIR, { recursive: true });

        const jsonString = JSON.stringify(events, null, 2);
        await fs.writeFile(tempPath, jsonString, 'utf-8');

        await fs.rename(tempPath, FILE_PATH);
    } catch (error) {
        await fs.unlink(tempPath).catch(() => {});
        throw new DataFileError('Failed to save events to the file.', error);
    }
}