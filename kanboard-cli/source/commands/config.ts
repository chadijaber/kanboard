import {Text, Box} from 'ink';
import React from 'react';
import {readConfig, writeConfig} from '../utils/config.js';

interface ConfigOptions {
	name?: string;
	description?: string;
	githubUrl?: string;
}

export function configCommand(options: ConfigOptions): React.ReactNode {
	const config = readConfig();

	if (!config) {
		return React.createElement(
			Text,
			{color: 'red'},
			'No kanboard project found. Run "kanboard init" first.',
		);
	}

	const hasUpdates =
		options.name !== undefined ||
		options.description !== undefined ||
		options.githubUrl !== undefined;

	if (hasUpdates) {
		if (options.name !== undefined) {
			config.project.name = options.name;
		}
		if (options.description !== undefined) {
			config.project.description = options.description;
		}
		if (options.githubUrl !== undefined) {
			config.project.githubUrl = options.githubUrl || null;
		}
		config.project.updatedAt = new Date().toISOString();
		writeConfig(config);
		return React.createElement(
			Text,
			{color: 'green'},
			'Project configuration updated.',
		);
	}

	const {project} = config;

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(Text, {bold: true}, 'Project Configuration:'),
		React.createElement(Text, null, ''),
		React.createElement(Text, null, `Name: ${project.name}`),
		React.createElement(
			Text,
			null,
			`Description: ${project.description || '(none)'}`,
		),
		React.createElement(
			Text,
			null,
			`GitHub URL: ${project.githubUrl || '(none)'}`,
		),
		React.createElement(Text, null, `Created: ${project.createdAt}`),
		React.createElement(Text, null, `Updated: ${project.updatedAt}`),
	);
}
