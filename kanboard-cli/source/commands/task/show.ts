import {Text, Box} from 'ink';
import React from 'react';
import {getTask} from '../../utils/tasks.js';
import {TASK_STATUS_LABELS} from '../../types/index.js';

interface TaskShowOptions {
	id?: string;
}

export function taskShowCommand(options: TaskShowOptions): React.ReactNode {
	if (!options.id) {
		return React.createElement(Text, {color: 'red'}, 'Task ID is required.');
	}

	const task = getTask(options.id);
	if (!task) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Task not found: ${options.id}`,
		);
	}

	const checklist = task.checklist ?? [];

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(Text, {bold: true}, task.name),
		React.createElement(Text, null, ''),
		React.createElement(Text, null, `ID: ${task.id}`),
		React.createElement(
			Text,
			null,
			`Status: ${TASK_STATUS_LABELS[task.status]}`,
		),
		React.createElement(Text, null, `Owner: ${task.owner ?? '(unassigned)'}`),
		React.createElement(Text, null, `Deadline: ${task.deadline ?? '(none)'}`),
		React.createElement(Text, null, ''),
		React.createElement(Text, {bold: true}, 'Description:'),
		React.createElement(Text, null, task.description || '(no description)'),
		React.createElement(Text, null, ''),
		React.createElement(Text, {bold: true}, 'Requirements:'),
		task.requirements.length > 0
			? React.createElement(
					Box,
					{flexDirection: 'column'},
					...task.requirements.map((req, i) =>
						React.createElement(Text, {key: i}, `  - ${req}`),
					),
			  )
			: React.createElement(Text, {dimColor: true}, '  (none)'),
		React.createElement(Text, null, ''),
		React.createElement(Text, {bold: true}, `Checklist (${checklist.filter(i => i.completed).length}/${checklist.length}):`),
		checklist.length > 0
			? React.createElement(
					Box,
					{flexDirection: 'column'},
					...checklist.map((item, i) =>
						React.createElement(
							Text,
							{key: i},
							`  ${item.completed ? '[x]' : '[ ]'} ${item.text}`,
						),
					),
			  )
			: React.createElement(Text, {dimColor: true}, '  (none)'),
		React.createElement(Text, null, ''),
		React.createElement(Text, {dimColor: true}, `Created: ${task.createdAt}`),
		React.createElement(Text, {dimColor: true}, `Updated: ${task.updatedAt}`),
	);
}
