import React, {useMemo, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {
	TASK_STATUS_ORDER,
	type TaskStatus,
	type Task,
} from '../../types/index.js';
import {Column} from '../board/Column.js';
import {getTasksByStatusForSprint} from '../../utils/tasks.js';
import {getActiveSprint} from '../../utils/sprints.js';
import {formatDeadlineShort, daysUntilDeadline} from '../../utils/date.js';

interface BoardViewProps {
	width: number;
}

export function BoardView({width}: BoardViewProps) {
	const {config, moveTask, deleteTask, setSelectedTaskId, updateTask} =
		useKanboard();
	const {
		selectedColumn,
		selectedRow,
		setSelectedRow,
		moveColumnLeft,
		moveColumnRight,
		moveRowUp,
		moveRowDown,
		setActiveModal,
		getStatusForColumn,
		setEditingTaskId,
		setConfirmAction,
		setConfirmMessage,
	} = useNavigation();

	const [moveMode, setMoveMode] = useState(false);
	const [checklistMode, setChecklistMode] = useState(false);
	const [checklistIndex, setChecklistIndex] = useState(0);

	const tasksByStatus = useMemo(() => {
		if (!config) return new Map<TaskStatus, Task[]>();
		return getTasksByStatusForSprint(config, config.activeSprintId);
	}, [config]);

	const activeSprint = useMemo(
		() => (config ? getActiveSprint(config) : null),
		[config],
	);

	const MAX_VISIBLE = 3;
	const columnWidth = Math.floor(width / TASK_STATUS_ORDER.length);
	const scrollOffset = Math.max(0, selectedRow - (MAX_VISIBLE - 1));

	const currentStatus = getStatusForColumn(selectedColumn);
	const currentTasks = tasksByStatus.get(currentStatus) ?? [];
	const selectedTask = currentTasks[selectedRow];

	useInput((input, key) => {
		if (!config) return;

		// Handle checklist mode
		if (checklistMode) {
			const checklist = selectedTask?.checklist ?? [];
			if (key.escape) {
				setChecklistMode(false);
				return;
			}
			if ((input === 'j' || key.downArrow) && checklist.length > 0) {
				setChecklistIndex(i => Math.min(i + 1, checklist.length - 1));
				return;
			}
			if ((input === 'k' || key.upArrow) && checklist.length > 0) {
				setChecklistIndex(i => Math.max(i - 1, 0));
				return;
			}
			if (input === ' ' && selectedTask && checklist.length > 0) {
				const updated = checklist.map((item, idx) =>
					idx === checklistIndex ? {...item, completed: !item.completed} : item,
				);
				updateTask(selectedTask.id, {checklist: updated});
				return;
			}
			return;
		}

		// Handle move mode
		if (moveMode) {
			if (input === 'h' || key.leftArrow) {
				if (selectedTask && selectedColumn > 0) {
					const newStatus = getStatusForColumn(selectedColumn - 1);
					moveTask(selectedTask.id, newStatus);
					moveColumnLeft();
					setSelectedRow(0);
				}
				setMoveMode(false);
				return;
			}
			if (input === 'l' || key.rightArrow) {
				if (selectedTask && selectedColumn < TASK_STATUS_ORDER.length - 1) {
					const newStatus = getStatusForColumn(selectedColumn + 1);
					moveTask(selectedTask.id, newStatus);
					moveColumnRight();
					setSelectedRow(0);
				}
				setMoveMode(false);
				return;
			}
			if (key.escape) {
				setMoveMode(false);
				return;
			}
			return;
		}

		// Navigation
		if (input === 'h' || key.leftArrow) {
			moveColumnLeft();
		} else if (input === 'l' || key.rightArrow) {
			moveColumnRight();
		} else if (input === 'j' || key.downArrow) {
			moveRowDown(currentTasks.length);
		} else if (input === 'k' || key.upArrow) {
			moveRowUp();
		}

		// Actions
		if (key.return && selectedTask) {
			setSelectedTaskId(selectedTask.id);
			setActiveModal('task-detail');
		}

		if (input === 'n') {
			setEditingTaskId(null);
			setActiveModal('task-form');
		}

		if (input === 'e' && selectedTask) {
			setEditingTaskId(selectedTask.id);
			setActiveModal('task-form');
		}

		if (input === 'm' && selectedTask) {
			setMoveMode(true);
		}

		if (
			input === 'c' &&
			selectedTask &&
			(selectedTask.checklist ?? []).length > 0
		) {
			setChecklistIndex(0);
			setChecklistMode(true);
		}

		if (input === 'S') {
			setActiveModal('sprint-switcher');
			return;
		}

		if (input === 'd' && selectedTask) {
			setConfirmMessage(`Delete task "${selectedTask.name}"?`);
			setConfirmAction(() => () => {
				deleteTask(selectedTask.id);
				if (selectedRow >= currentTasks.length - 1) {
					setSelectedRow(Math.max(0, selectedRow - 1));
				}
			});
			setActiveModal('confirm-delete');
		}
	});

	if (!config) {
		return <Text color="red">No config loaded</Text>;
	}

	const sprintBanner = (() => {
		if (activeSprint) {
			const deadlineParts: string[] = [];
			if (activeSprint.endDate) {
				const days = daysUntilDeadline(activeSprint.endDate);
				const formatted = formatDeadlineShort(activeSprint.endDate);
				if (days < 0) {
					deadlineParts.push(`${formatted} (overdue)`);
				} else if (days === 0) {
					deadlineParts.push(`${formatted} (today)`);
				} else {
					deadlineParts.push(`${formatted} (${days}d left)`);
				}
			}
			return (
				<Box marginBottom={1}>
					<Text color="cyan">Sprint: </Text>
					<Text bold>{activeSprint.name}</Text>
					{deadlineParts.length > 0 && (
						<Text dimColor> · {deadlineParts.join(' · ')}</Text>
					)}
					<Text dimColor> · press </Text>
					<Text color="yellow">S</Text>
					<Text dimColor> to switch</Text>
				</Box>
			);
		}
		return (
			<Box marginBottom={1}>
				<Text color="yellow">No active sprint. </Text>
				<Text dimColor>Press </Text>
				<Text color="yellow">S</Text>
				<Text dimColor>
					{' '}
					to pick one (or create one with `kanboard sprint add`).
				</Text>
			</Box>
		);
	})();

	return (
		<Box flexDirection="column">
			{sprintBanner}
			{moveMode && (
				<Box marginBottom={1}>
					<Text color="yellow">
						Move mode: Press h/l to move task, Esc to cancel
					</Text>
				</Box>
			)}
			<Box>
				{TASK_STATUS_ORDER.map((status, index) => (
					<Column
						key={status}
						status={status}
						tasks={tasksByStatus.get(status) ?? []}
						isSelected={index === selectedColumn}
						selectedTaskIndex={index === selectedColumn ? selectedRow : -1}
						width={columnWidth}
						checklistMode={index === selectedColumn && checklistMode}
						checklistIndex={checklistIndex}
						scrollOffset={index === selectedColumn ? scrollOffset : 0}
					/>
				))}
			</Box>
		</Box>
	);
}
