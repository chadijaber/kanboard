import React from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {TASK_STATUS_LABELS} from '../../types/index.js';
import {daysUntilDeadline, formatDeadlineShort} from '../../utils/date.js';

export function TaskDetailView() {
	const {config, selectedTaskId} = useKanboard();
	const {setActiveModal, setEditingTaskId} = useNavigation();

	const task = config?.tasks.find(t => t.id === selectedTaskId);
	const checklist = task?.checklist ?? [];

	useInput((input, key) => {
		if (key.escape) {
			setActiveModal('none');
			return;
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

	const deadlineColor = (() => {
		if (!task.deadline) return undefined;
		const days = daysUntilDeadline(task.deadline);
		if (days <= 0) return 'red';
		if (days <= 3) return 'yellow';
		return undefined;
	})();

	const deadlineLabel = (() => {
		if (!task.deadline) return '(none)';
		const days = daysUntilDeadline(task.deadline);
		const formatted = formatDeadlineShort(task.deadline);
		if (days <= 0) return `${formatted} (overdue)`;
		if (days === 1) return `${formatted} (tomorrow)`;
		return `${formatted} (${days} days left)`;
	})();

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
			<Box>
				<Box width={12}>
					<Text dimColor>Deadline:</Text>
				</Box>
				<Text color={deadlineColor}>{deadlineLabel}</Text>
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
			{checklist.length > 0 && (
				<Box marginTop={1} flexDirection="column">
					<Text dimColor>
						Checklist ({checklist.filter(i => i.completed).length}/
						{checklist.length}):
					</Text>
					{checklist.map(item => (
						<Box key={item.id}>
							<Text>
								{' '}
								{item.completed ? '[x]' : '[ ]'} {item.text}
							</Text>
						</Box>
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
				<Text dimColor>
					Press <Text color="yellow">e</Text> to edit,{' '}
					<Text color="yellow">Esc</Text> to close
				</Text>
			</Box>
		</Box>
	);
}
