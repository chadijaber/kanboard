import {v4 as uuidv4} from 'uuid';

export function generateId(): string {
	return uuidv4();
}

export function shortId(id: string): string {
	return id.slice(0, 8);
}
