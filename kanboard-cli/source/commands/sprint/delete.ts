import {Text, Box} from 'ink';
import React from 'react';
import {deleteSprint, getSprint} from '../../utils/sprints.js';
import {readConfig} from '../../utils/config.js';
import {shortId} from '../../utils/id.js';

interface SprintDeleteOptions {
	id?: string;
	force?: boolean;
}

export function sprintDeleteCommand(
	options: SprintDeleteOptions,
): React.ReactNode {
	if (!options.id) {
		return React.createElement(Text, {color: 'red'}, 'Sprint ID is required.');
	}

	const existing = getSprint(options.id);
	if (!existing) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Sprint not found: ${options.id}`,
		);
	}

	const config = readConfig();
	const taskCount = config
		? config.tasks.filter(t => t.sprintId === existing.id).length
		: 0;

	if (!options.force) {
		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(
				Text,
				{color: 'yellow'},
				`Are you sure you want to delete sprint "${existing.name}"?`,
			),
			taskCount > 0 &&
				React.createElement(
					Text,
					{dimColor: true},
					`${taskCount} task(s) will be moved back to the backlog.`,
				),
			React.createElement(
				Text,
				{dimColor: true},
				'Use --force or -f to confirm deletion.',
			),
		);
	}

	try {
		const sprint = deleteSprint(options.id);
		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(
				Text,
				{color: 'green'},
				`Sprint deleted: ${sprint.name}`,
			),
			taskCount > 0 &&
				React.createElement(
					Text,
					{dimColor: true},
					`${taskCount} task(s) moved back to backlog.`,
				),
			React.createElement(Text, {dimColor: true}, `ID: ${shortId(sprint.id)}`),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return React.createElement(Text, {color: 'red'}, message);
	}
}
