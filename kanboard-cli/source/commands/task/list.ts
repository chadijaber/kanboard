import {Text, Box} from 'ink';
import React from 'react';
import {readConfig} from '../../utils/config.js';
import {listTasks} from '../../utils/tasks.js';
import {TaskStatus, TASK_STATUS_LABELS} from '../../types/index.js';
import {shortId} from '../../utils/id.js';

interface TaskListOptions {
	status?: string;
	owner?: string;
	json?: boolean;
}

function parseStatus(status?: string): TaskStatus | undefined {
	if (!status) return undefined;
	const normalized = status.toLowerCase().replace(/-/g, '_');
	if (Object.values(TaskStatus).includes(normalized as TaskStatus)) {
		return normalized as TaskStatus;
	}
	return undefined;
}

export function taskListCommand(options: TaskListOptions): React.ReactNode {
	const config = readConfig();
	if (!config) {
		return React.createElement(
			Text,
			{color: 'red'},
			'No kanboard project found. Run "kanboard init" first.',
		);
	}

	const status = parseStatus(options.status);
	const tasks = listTasks(config, {status, owner: options.owner});

	if (options.json) {
		return React.createElement(Text, null, JSON.stringify(tasks, null, 2));
	}

	if (tasks.length === 0) {
		return React.createElement(Text, {dimColor: true}, 'No tasks found.');
	}

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		...tasks.map(task =>
			React.createElement(
				Box,
				{key: task.id, gap: 1},
				React.createElement(Text, {dimColor: true}, shortId(task.id)),
				React.createElement(
					Text,
					{color: 'cyan'},
					`[${TASK_STATUS_LABELS[task.status]}]`,
				),
				React.createElement(Text, null, task.name),
				task.owner &&
					React.createElement(Text, {dimColor: true}, `@${task.owner}`),
			),
		),
	);
}
