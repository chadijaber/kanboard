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
		return JSON.parse(content) as KanboardConfig;
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
		tasks: [],
		docs: [],
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
