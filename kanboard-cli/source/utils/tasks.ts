import type {Task, TaskStatus, KanboardConfig, ChecklistItem} from '../types/index.js';
import {generateId} from './id.js';
import {readConfig, writeConfig} from './config.js';

export interface CreateTaskInput {
	name: string;
	description?: string;
	owner?: string;
	status?: TaskStatus;
	requirements?: string[];
	checklist?: ChecklistItem[];
	deadline?: string | null;
}

export function createTask(input: CreateTaskInput): Task {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const now = new Date().toISOString();
	const tasksInStatus = config.tasks.filter(
		t => t.status === (input.status ?? 'backlog'),
	);
	const maxOrder = tasksInStatus.reduce((max, t) => Math.max(max, t.order), -1);

	const task: Task = {
		id: generateId(),
		name: input.name,
		description: input.description ?? '',
		owner: input.owner ?? null,
		requirements: input.requirements ?? [],
		checklist: input.checklist ?? [],
		deadline: input.deadline ?? null,
		status: input.status ?? ('backlog' as TaskStatus),
		createdAt: now,
		updatedAt: now,
		order: maxOrder + 1,
	};

	config.tasks.push(task);
	writeConfig(config);

	return task;
}

export interface UpdateTaskInput {
	name?: string;
	description?: string;
	owner?: string | null;
	status?: TaskStatus;
	requirements?: string[];
	checklist?: ChecklistItem[];
	deadline?: string | null;
	order?: number;
}

export function updateTask(id: string, input: UpdateTaskInput): Task {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const taskIndex = config.tasks.findIndex(
		t => t.id === id || t.id.startsWith(id),
	);
	if (taskIndex === -1) {
		throw new Error(`Task not found: ${id}`);
	}

	const task = config.tasks[taskIndex]!;
	const now = new Date().toISOString();

	if (input.name !== undefined) task.name = input.name;
	if (input.description !== undefined) task.description = input.description;
	if (input.owner !== undefined) task.owner = input.owner;
	if (input.status !== undefined) task.status = input.status;
	if (input.requirements !== undefined) task.requirements = input.requirements;
	if (input.checklist !== undefined) task.checklist = input.checklist;
	if (input.deadline !== undefined) task.deadline = input.deadline;
	if (input.order !== undefined) task.order = input.order;
	task.updatedAt = now;

	writeConfig(config);
	return task;
}

export function moveTask(id: string, status: TaskStatus): Task {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const task = config.tasks.find(t => t.id === id || t.id.startsWith(id));
	if (!task) {
		throw new Error(`Task not found: ${id}`);
	}

	const tasksInNewStatus = config.tasks.filter(
		t => t.status === status && t.id !== task.id,
	);
	const maxOrder = tasksInNewStatus.reduce(
		(max, t) => Math.max(max, t.order),
		-1,
	);

	task.status = status;
	task.order = maxOrder + 1;
	task.updatedAt = new Date().toISOString();

	writeConfig(config);
	return task;
}

export function deleteTask(id: string): Task {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const taskIndex = config.tasks.findIndex(
		t => t.id === id || t.id.startsWith(id),
	);
	if (taskIndex === -1) {
		throw new Error(`Task not found: ${id}`);
	}

	const task = config.tasks[taskIndex]!;
	config.tasks.splice(taskIndex, 1);
	writeConfig(config);

	return task;
}

export function getTask(id: string): Task | null {
	const config = readConfig();
	if (!config) {
		return null;
	}

	return config.tasks.find(t => t.id === id || t.id.startsWith(id)) ?? null;
}

export function listTasks(
	config: KanboardConfig,
	filters?: {status?: TaskStatus; owner?: string},
): Task[] {
	let tasks = [...config.tasks];

	if (filters?.status) {
		tasks = tasks.filter(t => t.status === filters.status);
	}

	if (filters?.owner) {
		tasks = tasks.filter(t => t.owner === filters.owner);
	}

	return tasks.sort((a, b) => {
		if (a.status !== b.status) {
			return a.status.localeCompare(b.status);
		}
		return a.order - b.order;
	});
}

export function getTasksByStatus(
	config: KanboardConfig,
): Map<TaskStatus, Task[]> {
	const taskMap = new Map<TaskStatus, Task[]>();

	for (const task of config.tasks) {
		const tasks = taskMap.get(task.status) ?? [];
		tasks.push(task);
		taskMap.set(task.status, tasks);
	}

	// Sort each list by order
	for (const [status, tasks] of taskMap) {
		taskMap.set(
			status,
			tasks.sort((a, b) => a.order - b.order),
		);
	}

	return taskMap;
}
