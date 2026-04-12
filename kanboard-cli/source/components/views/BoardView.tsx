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
import {getTasksByStatus} from '../../utils/tasks.js';

interface BoardViewProps {
	width: number;
}

export function BoardView({width}: BoardViewProps) {
	const {config, moveTask, deleteTask, setSelectedTaskId} = useKanboard();
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

	const tasksByStatus = useMemo(() => {
		if (!config) return new Map<TaskStatus, Task[]>();
		return getTasksByStatus(config);
	}, [config]);

	const columnWidth = Math.floor((width - 2) / TASK_STATUS_ORDER.length);

	const currentStatus = getStatusForColumn(selectedColumn);
	const currentTasks = tasksByStatus.get(currentStatus) ?? [];
	const selectedTask = currentTasks[selectedRow];

	useInput((input, key) => {
		if (!config) return;

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

	return (
		<Box flexDirection="column">
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
					/>
				))}
			</Box>
		</Box>
	);
}
