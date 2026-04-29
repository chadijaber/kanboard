import type {
	Task,
	TaskStatus,
	KanboardConfig,
	ChecklistItem,
} from '../types/index.js';
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
	sprintId?: string | null;
}

export function createTask(input: CreateTaskInput): Task {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	// Resolve sprintId (allow short id matching)
	let sprintId: string | null = null;
	if (input.sprintId) {
		const sprint = config.sprints.find(
			s => s.id === input.sprintId || s.id.startsWith(input.sprintId!),
		);
		if (!sprint) {
			throw new Error(`Sprint not found: ${input.sprintId}`);
		}
		sprintId = sprint.id;
	}

	// Apply invariant: assigned sprint ⇒ default status 'todo' (not backlog);
	// no sprint ⇒ status must be 'backlog'.
	let status: TaskStatus;
	if (sprintId === null) {
		status = 'backlog' as TaskStatus;
	} else {
		status =
			input.status && input.status !== 'backlog'
				? input.status
				: ('todo' as TaskStatus);
	}

	const now = new Date().toISOString();
	const tasksInStatus = config.tasks.filter(t => t.status === status);
	const maxOrder = tasksInStatus.reduce((max, t) => Math.max(max, t.order), -1);

	const task: Task = {
		id: generateId(),
		name: input.name,
		description: input.description ?? '',
		owner: input.owner ?? null,
		requirements: input.requirements ?? [],
		checklist: input.checklist ?? [],
		deadline: input.deadline ?? null,
		status,
		sprintId,
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
	sprintId?: string | null;
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
	if (input.requirements !== undefined) task.requirements = input.requirements;
	if (input.checklist !== undefined) task.checklist = input.checklist;
	if (input.deadline !== undefined) task.deadline = input.deadline;
	if (input.order !== undefined) task.order = input.order;

	// Resolve sprintId (allow short id) before applying invariants.
	let nextSprintId: string | null | undefined = undefined;
	if (input.sprintId !== undefined) {
		if (input.sprintId === null) {
			nextSprintId = null;
		} else {
			const sprint = config.sprints.find(
				s => s.id === input.sprintId || s.id.startsWith(input.sprintId!),
			);
			if (!sprint) {
				throw new Error(`Sprint not found: ${input.sprintId}`);
			}
			nextSprintId = sprint.id;
		}
	}

	if (input.status !== undefined) task.status = input.status;

	if (nextSprintId !== undefined) {
		task.sprintId = nextSprintId;
	}

	// Apply invariants:
	// - sprintId === null → status must be 'backlog'
	// - sprintId !== null and current status is 'backlog' → bump to 'todo'
	if (task.sprintId === null) {
		task.status = 'backlog' as TaskStatus;
	} else if (task.status === 'backlog') {
		task.status = 'todo' as TaskStatus;
	}

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

	// Enforce sprint invariant on move.
	if (status === 'backlog') {
		task.sprintId = null;
	} else if (!task.sprintId) {
		if (!config.activeSprintId) {
			throw new Error(
				'Cannot move task out of backlog without an active sprint. ' +
					'Create or activate a sprint first, or assign the task with --sprint.',
			);
		}
		task.sprintId = config.activeSprintId;
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

/**
 * Build the sprint-aware column map used by the board view:
 * - The 'backlog' column always contains every un-sprinted task (sprintId === null).
 * - The other four columns only contain tasks for `sprintId`. When sprintId is
 *   null, those columns come back empty.
 */
export function getTasksByStatusForSprint(
	config: KanboardConfig,
	sprintId: string | null,
): Map<TaskStatus, Task[]> {
	const taskMap = new Map<TaskStatus, Task[]>();

	for (const task of config.tasks) {
		const inBacklog = task.status === 'backlog' && task.sprintId === null;
		const inSprint = sprintId !== null && task.sprintId === sprintId;
		if (!inBacklog && !inSprint) continue;

		const tasks = taskMap.get(task.status) ?? [];
		tasks.push(task);
		taskMap.set(task.status, tasks);
	}

	for (const [status, tasks] of taskMap) {
		taskMap.set(
			status,
			tasks.sort((a, b) => a.order - b.order),
		);
	}

	return taskMap;
}
