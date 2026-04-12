import {Text} from 'ink';
import React from 'react';
import {
	configExists,
	createDefaultConfig,
	writeConfig,
	CONFIG_FILENAME,
} from '../utils/config.js';
import path from 'path';

interface InitOptions {
	name?: string;
	description?: string;
	githubUrl?: string;
}

export function initCommand(options: InitOptions): React.ReactNode {
	const cwd = process.cwd();

	if (configExists(cwd)) {
		return React.createElement(
			Text,
			{color: 'yellow'},
			`Project already initialized. ${CONFIG_FILENAME} exists.`,
		);
	}

	const config = createDefaultConfig({
		name: options.name,
		description: options.description,
		githubUrl: options.githubUrl,
	});

	writeConfig(config, path.join(cwd, CONFIG_FILENAME));

	return React.createElement(
		Text,
		{color: 'green'},
		`Initialized kanboard project "${config.project.name}" in ${CONFIG_FILENAME}`,
	);
}
