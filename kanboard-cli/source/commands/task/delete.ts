import {Text, Box} from 'ink';
import React from 'react';
import {deleteTask, getTask} from '../../utils/tasks.js';
import {shortId} from '../../utils/id.js';

interface TaskDeleteOptions {
	id?: string;
	force?: boolean;
}

export function taskDeleteCommand(options: TaskDeleteOptions): React.ReactNode {
	if (!options.id) {
		return React.createElement(Text, {color: 'red'}, 'Task ID is required.');
	}

	const existingTask = getTask(options.id);
	if (!existingTask) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Task not found: ${options.id}`,
		);
	}

	if (!options.force) {
		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(
				Text,
				{color: 'yellow'},
				`Are you sure you want to delete "${existingTask.name}"?`,
			),
			React.createElement(
				Text,
				{dimColor: true},
				'Use --force or -f to confirm deletion.',
			),
		);
	}

	try {
		const task = deleteTask(options.id);

		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(Text, {color: 'green'}, `Task deleted: ${task.name}`),
			React.createElement(Text, {dimColor: true}, `ID: ${shortId(task.id)}`),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return React.createElement(Text, {color: 'red'}, message);
	}
}
