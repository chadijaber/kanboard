import {Text, Box} from 'ink';
import React from 'react';
import {moveTask} from '../../utils/tasks.js';
import {TaskStatus, TASK_STATUS_LABELS} from '../../types/index.js';
import {shortId} from '../../utils/id.js';

interface TaskMoveOptions {
	id?: string;
	status?: string;
}

function parseStatus(status?: string): TaskStatus | undefined {
	if (!status) return undefined;
	const normalized = status.toLowerCase().replace(/-/g, '_');
	if (Object.values(TaskStatus).includes(normalized as TaskStatus)) {
		return normalized as TaskStatus;
	}
	return undefined;
}

export function taskMoveCommand(options: TaskMoveOptions): React.ReactNode {
	if (!options.id) {
		return React.createElement(Text, {color: 'red'}, 'Task ID is required.');
	}

	if (!options.status) {
		return React.createElement(Text, {color: 'red'}, 'Status is required.');
	}

	const status = parseStatus(options.status);
	if (!status) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Invalid status: ${options.status}. Valid values: backlog, todo, in_progress, review, done`,
		);
	}

	try {
		const task = moveTask(options.id, status);

		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(
				Text,
				{color: 'green'},
				`Task moved to ${TASK_STATUS_LABELS[status]}: ${task.name}`,
			),
			React.createElement(Text, {dimColor: true}, `ID: ${shortId(task.id)}`),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return React.createElement(Text, {color: 'red'}, message);
	}
}
