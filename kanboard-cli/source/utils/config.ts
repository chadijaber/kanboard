import fs from 'fs-extra';
import path from 'path';
import type {KanboardConfig, Project} from '../types/index.js';

export const CONFIG_FILENAME = '.kanboard.json';

export function findConfigPath(
	startDir: string = process.cwd(),
): string | null {
	let currentDir = startDir;

	while (currentDir !== path.parse(currentDir).root) {
		const configPath = path.join(currentDir, CONFIG_FILENAME);
		if (fs.existsSync(configPath)) {
			return configPath;
		}
		currentDir = path.dirname(currentDir);
	}

	// Check root directory
	const rootConfigPath = path.join(currentDir, CONFIG_FILENAME);
	if (fs.existsSync(rootConfigPath)) {
		return rootConfigPath;
	}

	return null;
}

export function readConfig(configPath?: string): KanboardConfig | null {
	const resolvedPath = configPath ?? findConfigPath();
	if (!resolvedPath) {
		return null;
	}

	try {
		const content = fs.readFileSync(resolvedPath, 'utf-8');
		const config = JSON.parse(content) as KanboardConfig;
		// Migration: add members field if missing from older configs
		if (!Array.isArray(config.members)) {
			config.members = [];
		}
		// Migration: add checklist and deadline fields to existing tasks
		for (const task of config.tasks) {
			if (!Array.isArray(task.checklist)) {
				task.checklist = [];
			}
			if (!('deadline' in task)) {
				(task as any).deadline = null;
			}
			if (!('sprintId' in task)) {
				(task as any).sprintId = null;
			}
			// Repair invariant: backlog tasks must have null sprintId,
			// non-backlog tasks must have a sprintId — fall back to backlog if not.
			if (task.status === 'backlog' && task.sprintId !== null) {
				task.sprintId = null;
			} else if (task.status !== 'backlog' && !task.sprintId) {
				task.status = 'backlog' as any;
				task.sprintId = null;
			}
		}
		// Migration: add sprints fields if missing
		if (!Array.isArray(config.sprints)) {
			config.sprints = [];
		}
		if (!('activeSprintId' in config)) {
			(config as any).activeSprintId = null;
		}
		// Repair: clear activeSprintId if it points to a deleted sprint
		if (
			config.activeSprintId &&
			!config.sprints.some(s => s.id === config.activeSprintId)
		) {
			config.activeSprintId = null;
		}
		// Ensure each sprint has a milestones array (forward compat)
		for (const sprint of config.sprints) {
			if (!Array.isArray(sprint.milestones)) {
				sprint.milestones = [];
			}
		}
		return config;
	} catch {
		return null;
	}
}

export function writeConfig(config: KanboardConfig, configPath?: string): void {
	const resolvedPath =
		configPath ?? findConfigPath() ?? path.join(process.cwd(), CONFIG_FILENAME);
	fs.writeFileSync(resolvedPath, JSON.stringify(config, null, 2) + '\n');
}

export function createDefaultConfig(project: Partial<Project>): KanboardConfig {
	const now = new Date().toISOString();
	return {
		version: '1.0',
		project: {
			name: project.name ?? 'Untitled Project',
			description: project.description ?? '',
			githubUrl: project.githubUrl ?? null,
			createdAt: now,
			updatedAt: now,
		},
		members: [],
		tasks: [],
		docs: [],
		sprints: [],
		activeSprintId: null,
	};
}

export function configExists(dir: string = process.cwd()): boolean {
	return fs.existsSync(path.join(dir, CONFIG_FILENAME));
}

export function getConfigDir(configPath?: string): string {
	const resolvedPath = configPath ?? findConfigPath();
	if (!resolvedPath) {
		return process.cwd();
	}
	return path.dirname(resolvedPath);
}
