import type {
	Sprint,
	SprintStatus,
	KanboardConfig,
	TaskStatus,
	ChecklistItem,
} from '../types/index.js';
import {generateId} from './id.js';
import {readConfig, writeConfig} from './config.js';

export interface CreateSprintInput {
	name: string;
	description?: string;
	startDate?: string | null;
	endDate?: string | null;
	milestones?: ChecklistItem[];
	status?: SprintStatus;
}

export function createSprint(input: CreateSprintInput): Sprint {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const now = new Date().toISOString();
	const sprint: Sprint = {
		id: generateId(),
		name: input.name,
		description: input.description ?? '',
		startDate: input.startDate ?? null,
		endDate: input.endDate ?? null,
		milestones: input.milestones ?? [],
		status: input.status ?? 'planning',
		createdAt: now,
		updatedAt: now,
	};

	config.sprints.push(sprint);
	writeConfig(config);

	return sprint;
}

export interface UpdateSprintInput {
	name?: string;
	description?: string;
	startDate?: string | null;
	endDate?: string | null;
	milestones?: ChecklistItem[];
	status?: SprintStatus;
}

export function updateSprint(id: string, input: UpdateSprintInput): Sprint {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const sprint = config.sprints.find(s => s.id === id || s.id.startsWith(id));
	if (!sprint) {
		throw new Error(`Sprint not found: ${id}`);
	}

	if (input.name !== undefined) sprint.name = input.name;
	if (input.description !== undefined) sprint.description = input.description;
	if (input.startDate !== undefined) sprint.startDate = input.startDate;
	if (input.endDate !== undefined) sprint.endDate = input.endDate;
	if (input.milestones !== undefined) sprint.milestones = input.milestones;
	if (input.status !== undefined) sprint.status = input.status;
	sprint.updatedAt = new Date().toISOString();

	writeConfig(config);
	return sprint;
}

export function deleteSprint(id: string): Sprint {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const idx = config.sprints.findIndex(s => s.id === id || s.id.startsWith(id));
	if (idx === -1) {
		throw new Error(`Sprint not found: ${id}`);
	}

	const sprint = config.sprints[idx]!;

	// Move associated tasks back to backlog.
	for (const task of config.tasks) {
		if (task.sprintId === sprint.id) {
			task.sprintId = null;
			task.status = 'backlog' as TaskStatus;
			task.updatedAt = new Date().toISOString();
		}
	}

	if (config.activeSprintId === sprint.id) {
		config.activeSprintId = null;
	}

	config.sprints.splice(idx, 1);
	writeConfig(config);
	return sprint;
}

export function activateSprint(id: string): Sprint {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const sprint = config.sprints.find(s => s.id === id || s.id.startsWith(id));
	if (!sprint) {
		throw new Error(`Sprint not found: ${id}`);
	}

	config.activeSprintId = sprint.id;
	if (sprint.status === 'planning') {
		sprint.status = 'active';
		sprint.updatedAt = new Date().toISOString();
	}
	writeConfig(config);
	return sprint;
}

export function getSprint(id: string): Sprint | null {
	const config = readConfig();
	if (!config) return null;
	return config.sprints.find(s => s.id === id || s.id.startsWith(id)) ?? null;
}

export function listSprints(config: KanboardConfig): Sprint[] {
	return [...config.sprints].sort((a, b) =>
		a.createdAt.localeCompare(b.createdAt),
	);
}

export function getActiveSprint(config: KanboardConfig): Sprint | null {
	if (!config.activeSprintId) return null;
	return config.sprints.find(s => s.id === config.activeSprintId) ?? null;
}

const SPRINT_STATUS_VALUES: SprintStatus[] = [
	'planning',
	'active',
	'completed',
];

export function parseSprintStatus(value?: string): SprintStatus | null {
	if (!value) return null;
	const normalized = value.trim().toLowerCase();
	const match = SPRINT_STATUS_VALUES.find(s => s === normalized);
	return match ?? null;
}

export interface SprintProgress {
	total: number;
	byStatus: Record<TaskStatus, number>;
	donePct: number;
	milestoneTotal: number;
	milestoneDone: number;
}

export function getSprintProgress(
	config: KanboardConfig,
	sprintId: string,
): SprintProgress {
	const sprint = config.sprints.find(s => s.id === sprintId);
	const tasks = config.tasks.filter(t => t.sprintId === sprintId);

	const byStatus: Record<TaskStatus, number> = {
		backlog: 0,
		todo: 0,
		in_progress: 0,
		review: 0,
		done: 0,
	} as Record<TaskStatus, number>;

	for (const task of tasks) {
		byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
	}

	const total = tasks.length;
	const done = byStatus.done ?? 0;
	const donePct = total === 0 ? 0 : Math.round((done / total) * 100);

	const milestones = sprint?.milestones ?? [];
	return {
		total,
		byStatus,
		donePct,
		milestoneTotal: milestones.length,
		milestoneDone: milestones.filter(m => m.completed).length,
	};
}

export function renderProgressBar(donePct: number, width = 20): string {
	const clamped = Math.max(0, Math.min(100, donePct));
	const filled = Math.round((clamped / 100) * width);
	return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export function assignTaskToSprint(
	taskId: string,
	sprintId: string | null,
): void {
	const config = readConfig();
	if (!config) {
		throw new Error('No kanboard project found. Run "kanboard init" first.');
	}

	const task = config.tasks.find(
		t => t.id === taskId || t.id.startsWith(taskId),
	);
	if (!task) {
		throw new Error(`Task not found: ${taskId}`);
	}

	if (sprintId === null) {
		task.sprintId = null;
		task.status = 'backlog' as TaskStatus;
	} else {
		const sprint = config.sprints.find(
			s => s.id === sprintId || s.id.startsWith(sprintId),
		);
		if (!sprint) {
			throw new Error(`Sprint not found: ${sprintId}`);
		}
		task.sprintId = sprint.id;
		if (task.status === 'backlog') {
			task.status = 'todo' as TaskStatus;
		}
	}
	task.updatedAt = new Date().toISOString();
	writeConfig(config);
}
