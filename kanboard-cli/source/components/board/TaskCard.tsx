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
	return (
		<Box
			flexDirection="column"
			borderStyle={isSelected ? 'bold' : 'single'}
			borderColor={isSelected ? 'cyan' : 'gray'}
			paddingX={1}
			width={width}
		>
			<Text bold wrap="wrap">
				{task.name}
			</Text>
			<Box>
				<Text dimColor>{shortId(task.id)}</Text>
				{task.owner && <Text color="blue"> @{task.owner}</Text>}
			</Box>
		</Box>
	);
}
