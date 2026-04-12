import {Text, Box} from 'ink';
import React from 'react';
import {readConfig} from '../utils/config.js';
import {
	TaskStatus,
	TASK_STATUS_ORDER,
	TASK_STATUS_LABELS,
} from '../types/index.js';

interface StatusOptions {
	json?: boolean;
}

export function statusCommand(options: StatusOptions): React.ReactNode {
	const config = readConfig();

	if (!config) {
		return React.createElement(
			Text,
			{color: 'red'},
			'No kanboard project found. Run "kanboard init" first.',
		);
	}

	const counts: Record<TaskStatus, number> = {
		[TaskStatus.BACKLOG]: 0,
		[TaskStatus.TODO]: 0,
		[TaskStatus.IN_PROGRESS]: 0,
		[TaskStatus.REVIEW]: 0,
		[TaskStatus.DONE]: 0,
	};

	for (const task of config.tasks) {
		counts[task.status]++;
	}

	const total = config.tasks.length;
	const docsCount = config.docs.length;

	if (options.json) {
		const output = {
			project: config.project.name,
			tasks: counts,
			total,
			docs: docsCount,
		};
		return React.createElement(Text, null, JSON.stringify(output, null, 2));
	}

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(Text, {bold: true}, `Project: ${config.project.name}`),
		React.createElement(Text, null, ''),
		React.createElement(Text, {bold: true}, 'Task Status:'),
		...TASK_STATUS_ORDER.map(status =>
			React.createElement(
				Text,
				{key: status},
				`  ${TASK_STATUS_LABELS[status]}: ${counts[status]}`,
			),
		),
		React.createElement(Text, null, ''),
		React.createElement(Text, null, `Total tasks: ${total}`),
		React.createElement(Text, null, `Total docs: ${docsCount}`),
	);
}
