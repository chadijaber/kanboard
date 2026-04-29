import React from 'react';
import {Box, Text} from 'ink';
import type {Task, TaskStatus, Tag} from '../../types/index.js';
import {TASK_STATUS_LABELS} from '../../types/index.js';
import {TaskCard} from './TaskCard.js';

const MAX_VISIBLE = 3;

interface ColumnProps {
	status: TaskStatus;
	tasks: Task[];
	isSelected: boolean;
	selectedTaskIndex: number;
	width: number;
	checklistMode?: boolean;
	checklistIndex?: number;
	scrollOffset?: number;
	allTags?: Tag[];
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
	checklistMode = false,
	checklistIndex = 0,
	scrollOffset = 0,
	allTags = [],
}: ColumnProps) {
	const color = STATUS_COLORS[status];
	const cardWidth = width - 4;

	const offset = isSelected ? scrollOffset : 0;
	const visibleTasks = tasks.slice(offset, offset + MAX_VISIBLE);
	const hasAbove = offset > 0;
	const hasBelow = offset + MAX_VISIBLE < tasks.length;
	const visibleSelectedIndex = selectedTaskIndex - offset;

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
				{hasAbove && <Text dimColor>↑ {offset} more above</Text>}
				{visibleTasks.length === 0 ? (
					<Text dimColor>No tasks</Text>
				) : (
					visibleTasks.map((task, index) => (
						<TaskCard
							key={task.id}
							task={task}
							isSelected={isSelected && index === visibleSelectedIndex}
							width={cardWidth}
							checklistMode={
								isSelected && index === visibleSelectedIndex && checklistMode
							}
							checklistIndex={checklistIndex}
							allTags={allTags}
						/>
					))
				)}
				{hasBelow && (
					<Text dimColor>
						↓ {tasks.length - offset - MAX_VISIBLE} more below
					</Text>
				)}
			</Box>
		</Box>
	);
}
