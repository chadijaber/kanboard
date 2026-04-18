import React from 'react';
import {Box, Text} from 'ink';
import type {Task} from '../../types/index.js';
import {
	formatCreatedDate,
	relativeTime,
	daysUntilDeadline,
	formatDeadlineShort,
} from '../../utils/date.js';

interface TaskCardProps {
	task: Task;
	isSelected: boolean;
	width: number;
	checklistMode?: boolean;
	checklistIndex?: number;
}

export function TaskCard({
	task,
	isSelected,
	width,
	checklistMode = false,
	checklistIndex = 0,
}: TaskCardProps) {
	const checklist = task.checklist ?? [];

	const deadlineColor = (() => {
		if (!task.deadline) return undefined;
		// Done tasks show no warning color
		if (task.status === 'done') return undefined;
		const days = daysUntilDeadline(task.deadline);
		if (days <= 0) return 'red';
		if (days <= 3) return 'yellow';
		return undefined;
	})();

	const deadlineLabel = (() => {
		if (!task.deadline) return null;
		// For completed tasks, show the completion date without warning text
		if (task.status === 'done') {
			return formatDeadlineShort(task.deadline);
		}
		const days = daysUntilDeadline(task.deadline);
		const formatted = formatDeadlineShort(task.deadline);
		if (days <= 0) return `Overdue: ${formatted}`;
		if (days <= 3) return days === 1 ? 'tomorrow' : `${days} days left`;
		return `${formatted}`;
	})();

	return (
		<Box
			flexDirection="column"
			borderStyle={isSelected ? 'bold' : 'single'}
			borderColor={isSelected ? 'cyan' : 'gray'}
			paddingX={1}
			width={width}
		>
			<Text dimColor>{formatCreatedDate(task.createdAt)}</Text>
			<Text dimColor>({relativeTime(task.createdAt)})</Text>
			<Text bold wrap="wrap">
				{task.name}
			</Text>
			{task.owner ? <Text color="blue">@{task.owner}</Text> : null}
			{task.deadline ? (
				<Text color={deadlineColor}>{deadlineLabel}</Text>
			) : null}
			{checklist.length > 0 ? (
				checklistMode ? (
					<Box flexDirection="column" marginTop={0}>
						{checklist.map((item, i) => (
							<Text
								key={item.id}
								color={i === checklistIndex ? 'cyan' : undefined}
							>
								{i === checklistIndex ? '>' : ' '}{' '}
								{item.completed ? '[x]' : '[ ]'} {item.text}
							</Text>
						))}
						<Text dimColor>j/k: navigate | Space: toggle | Esc: exit</Text>
					</Box>
				) : (
					<Text dimColor>
						☑ {checklist.filter(i => i.completed).length}/{checklist.length}
					</Text>
				)
			) : null}
		</Box>
	);
}
