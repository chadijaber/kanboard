import {Text, Box} from 'ink';
import React from 'react';
import {createSprint, parseSprintStatus} from '../../utils/sprints.js';
import {shortId} from '../../utils/id.js';

interface SprintAddOptions {
	name?: string;
	description?: string;
	start?: string;
	end?: string;
	status?: string;
}

export function sprintAddCommand(options: SprintAddOptions): React.ReactNode {
	if (!options.name) {
		return React.createElement(
			Text,
			{color: 'red'},
			'Sprint name is required. Use --name or -n',
		);
	}

	const status = parseSprintStatus(options.status);
	if (options.status && !status) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Invalid sprint status: ${options.status}. Valid values: planning, active, completed`,
		);
	}

	try {
		const sprint = createSprint({
			name: options.name,
			description: options.description,
			startDate: options.start ?? null,
			endDate: options.end ?? null,
			status: status ?? undefined,
		});

		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(
				Text,
				{color: 'green'},
				`Sprint created: ${sprint.name}`,
			),
			React.createElement(Text, {dimColor: true}, `ID: ${shortId(sprint.id)}`),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return React.createElement(Text, {color: 'red'}, message);
	}
}
