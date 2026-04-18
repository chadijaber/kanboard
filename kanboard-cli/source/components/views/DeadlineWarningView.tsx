import React from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {daysUntilDeadline, formatDeadlineShort} from '../../utils/date.js';

export function DeadlineWarningView() {
	const {config} = useKanboard();
	const {setActiveModal} = useNavigation();

	useInput(() => {
		setActiveModal('none');
	});

	const urgentTasks =
		config?.tasks.filter(
			t => t.deadline && daysUntilDeadline(t.deadline) < 3 && t.status !== 'done',
		) ?? [];

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="red"
			padding={1}
			marginY={1}
		>
			<Text bold color="red">
				⚠ Deadline Warning
			</Text>
			<Box marginTop={1} flexDirection="column">
				{urgentTasks.map(task => {
					const days = daysUntilDeadline(task.deadline!);
					const formatted = formatDeadlineShort(task.deadline!);
					const label =
						days <= 0
							? `OVERDUE (${formatted})`
							: days === 1
								? `tomorrow (${formatted})`
								: `${days} days (${formatted})`;
					return (
						<Box key={task.id}>
							<Text color="red">• </Text>
							<Text bold>{task.name}</Text>
							<Text color="red"> — Due: {label}</Text>
						</Box>
					);
				})}
			</Box>
			<Box marginTop={1}>
				<Text dimColor>Press any key to continue</Text>
			</Box>
		</Box>
	);
}
