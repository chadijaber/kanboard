import React from 'react';
import {Box, Text} from 'ink';
import type {Task, TaskStatus} from '../../types/index.js';
import {TASK_STATUS_LABELS} from '../../types/index.js';
import {TaskCard} from './TaskCard.js';

interface ColumnProps {
	status: TaskStatus;
	tasks: Task[];
	isSelected: boolean;
	selectedTaskIndex: number;
	width: number;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
	backlog: 'gray',
	todo: 'blue',
	in_progress: 'yellow',
	review: 'magenta',
	done: 'green',
};

export function Column({
	status,
	tasks,
	isSelected,
	selectedTaskIndex,
	width,
}: ColumnProps) {
	const color = STATUS_COLORS[status];
	const cardWidth = width - 2;

	return (
		<Box
			flexDirection="column"
			width={width}
			borderStyle={isSelected ? 'bold' : 'single'}
			borderColor={isSelected ? 'cyan' : 'gray'}
		>
			<Box
				justifyContent="center"
				paddingX={1}
				borderStyle="single"
				borderTop={false}
				borderLeft={false}
				borderRight={false}
				borderColor={color}
			>
				<Text bold color={color}>
					{TASK_STATUS_LABELS[status]} ({tasks.length})
				</Text>
			</Box>
			<Box flexDirection="column" padding={1} gap={1}>
				{tasks.length === 0 ? (
					<Text dimColor>No tasks</Text>
				) : (
					tasks.map((task, index) => (
						<TaskCard
							key={task.id}
							task={task}
							isSelected={isSelected && index === selectedTaskIndex}
							width={cardWidth}
						/>
					))
				)}
			</Box>
		</Box>
	);
}
