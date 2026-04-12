import React from 'react';
import {Box, Text} from 'ink';
import type {Task} from '../../types/index.js';
import {shortId} from '../../utils/id.js';

interface TaskCardProps {
	task: Task;
	isSelected: boolean;
	width: number;
}

export function TaskCard({task, isSelected, width}: TaskCardProps) {
	const maxNameLength = width - 4;
	const displayName =
		task.name.length > maxNameLength
			? task.name.slice(0, maxNameLength - 1) + '\u2026'
			: task.name;

	return (
		<Box
			flexDirection="column"
			borderStyle={isSelected ? 'bold' : 'single'}
			borderColor={isSelected ? 'cyan' : 'gray'}
			paddingX={1}
			width={width}
		>
			<Text bold wrap="truncate">
				{displayName}
			</Text>
			<Box>
				<Text dimColor>{shortId(task.id)}</Text>
				{task.owner && <Text color="blue"> @{task.owner}</Text>}
			</Box>
		</Box>
	);
}
