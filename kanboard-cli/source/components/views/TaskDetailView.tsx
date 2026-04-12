import React from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {TASK_STATUS_LABELS} from '../../types/index.js';

export function TaskDetailView() {
	const {config, selectedTaskId} = useKanboard();
	const {setActiveModal, setEditingTaskId} = useNavigation();

	const task = config?.tasks.find(t => t.id === selectedTaskId);

	useInput((input, key) => {
		if (key.escape) {
			setActiveModal('none');
		}

		if (input === 'e' && task) {
			setEditingTaskId(task.id);
			setActiveModal('task-form');
		}
	});

	if (!task) {
		return (
			<Box borderStyle="round" borderColor="red" padding={1}>
				<Text color="red">Task not found</Text>
			</Box>
		);
	}

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			padding={1}
			marginY={1}
		>
			<Text bold color="cyan">
				{task.name}
			</Text>
			<Box marginTop={1}>
				<Box width={12}>
					<Text dimColor>ID:</Text>
				</Box>
				<Text>{task.id}</Text>
			</Box>
			<Box>
				<Box width={12}>
					<Text dimColor>Status:</Text>
				</Box>
				<Text>{TASK_STATUS_LABELS[task.status]}</Text>
			</Box>
			<Box>
				<Box width={12}>
					<Text dimColor>Owner:</Text>
				</Box>
				<Text>{task.owner ?? '(unassigned)'}</Text>
			</Box>
			<Box marginTop={1} flexDirection="column">
				<Text dimColor>Description:</Text>
				<Text>{task.description || '(no description)'}</Text>
			</Box>
			{task.requirements.length > 0 && (
				<Box marginTop={1} flexDirection="column">
					<Text dimColor>Requirements:</Text>
					{task.requirements.map((req, i) => (
						<Text key={i}> - {req}</Text>
					))}
				</Box>
			)}
			<Box marginTop={1}>
				<Text dimColor>Created: {task.createdAt}</Text>
			</Box>
			<Box>
				<Text dimColor>Updated: {task.updatedAt}</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>Press </Text>
				<Text color="yellow">e</Text>
				<Text dimColor> to edit, </Text>
				<Text color="yellow">Esc</Text>
				<Text dimColor> to close</Text>
			</Box>
		</Box>
	);
}
