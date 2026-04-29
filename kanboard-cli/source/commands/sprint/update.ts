import {Text, Box} from 'ink';
import React from 'react';
import {updateSprint, parseSprintStatus} from '../../utils/sprints.js';
import {shortId} from '../../utils/id.js';

interface SprintUpdateOptions {
	id?: string;
	name?: string;
	description?: string;
	start?: string;
	end?: string;
	status?: string;
}

export function sprintUpdateCommand(
	options: SprintUpdateOptions,
): React.ReactNode {
	if (!options.id) {
		return React.createElement(Text, {color: 'red'}, 'Sprint ID is required.');
	}

	const status = parseSprintStatus(options.status);
	if (options.status && !status) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Invalid sprint status: ${options.status}. Valid values: planning, active, completed`,
		);
	}

	const hasUpdates =
		options.name !== undefined ||
		options.description !== undefined ||
		options.start !== undefined ||
		options.end !== undefined ||
		status !== null;

	if (!hasUpdates) {
		return React.createElement(
			Text,
			{color: 'yellow'},
			'No updates provided. Use --name, --description, --start, --end, or --status',
		);
	}

	try {
		const sprint = updateSprint(options.id, {
			name: options.name,
			description: options.description,
			startDate:
				options.start !== undefined ? options.start || null : undefined,
			endDate: options.end !== undefined ? options.end || null : undefined,
			status: status ?? undefined,
		});

		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(
				Text,
				{color: 'green'},
				`Sprint updated: ${sprint.name}`,
			),
			React.createElement(Text, {dimColor: true}, `ID: ${shortId(sprint.id)}`),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return React.createElement(Text, {color: 'red'}, message);
	}
}
