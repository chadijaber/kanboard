import {Text, Box} from 'ink';
import React from 'react';
import {activateSprint} from '../../utils/sprints.js';
import {shortId} from '../../utils/id.js';

interface SprintActivateOptions {
	id?: string;
}

export function sprintActivateCommand(
	options: SprintActivateOptions,
): React.ReactNode {
	if (!options.id) {
		return React.createElement(Text, {color: 'red'}, 'Sprint ID is required.');
	}

	try {
		const sprint = activateSprint(options.id);
		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(
				Text,
				{color: 'green'},
				`Active sprint: ${sprint.name}`,
			),
			React.createElement(Text, {dimColor: true}, `ID: ${shortId(sprint.id)}`),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return React.createElement(Text, {color: 'red'}, message);
	}
}
