import test from 'ava';
import {generateId, shortId} from './utils/id.js';
import {createDefaultConfig} from './utils/config.js';
import {TaskStatus} from './types/index.js';

test('generateId returns a valid UUID', t => {
	const id = generateId();
	t.regex(
		id,
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
	);
});

test('shortId returns first 8 characters', t => {
	const id = 'abcd1234-5678-90ab-cdef-1234567890ab';
	t.is(shortId(id), 'abcd1234');
});

test('createDefaultConfig creates valid config', t => {
	const config = createDefaultConfig({
		name: 'Test Project',
		description: 'A test',
		githubUrl: 'https://github.com/test/repo',
	});

	t.is(config.version, '1.0');
	t.is(config.project.name, 'Test Project');
	t.is(config.project.description, 'A test');
	t.is(config.project.githubUrl, 'https://github.com/test/repo');
	t.deepEqual(config.tasks, []);
	t.deepEqual(config.docs, []);
});

test('createDefaultConfig uses defaults for missing values', t => {
	const config = createDefaultConfig({});

	t.is(config.project.name, 'Untitled Project');
	t.is(config.project.description, '');
	t.is(config.project.githubUrl, null);
});

test('TaskStatus enum has correct values', t => {
	t.is(TaskStatus.BACKLOG, 'backlog' as TaskStatus);
	t.is(TaskStatus.TODO, 'todo' as TaskStatus);
	t.is(TaskStatus.IN_PROGRESS, 'in_progress' as TaskStatus);
	t.is(TaskStatus.REVIEW, 'review' as TaskStatus);
	t.is(TaskStatus.DONE, 'done' as TaskStatus);
});
