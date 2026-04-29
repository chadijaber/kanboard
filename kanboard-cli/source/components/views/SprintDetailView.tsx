import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {
	SPRINT_STATUS_LABELS,
	TASK_STATUS_LABELS,
	type TaskStatus,
} from '../../types/index.js';
import {getSprintProgress, renderProgressBar} from '../../utils/sprints.js';
import {daysUntilDeadline, formatDeadlineShort} from '../../utils/date.js';
import {shortId} from '../../utils/id.js';

export function SprintDetailView() {
	const {config, selectedSprintId, updateSprint, setCurrentView} =
		useKanboard();
	const {setActiveModal, setEditingSprintId} = useNavigation();
	const [milestoneIndex, setMilestoneIndex] = useState(0);

	const sprint = config?.sprints.find(s => s.id === selectedSprintId);

	useInput((input, key) => {
		if (!sprint) {
			if (key.escape) setCurrentView('sprints');
			return;
		}

		if (key.escape) {
			setCurrentView('sprints');
			return;
		}
		if (input === 'e') {
			setEditingSprintId(sprint.id);
			setActiveModal('sprint-form');
			return;
		}
		const milestones = sprint.milestones ?? [];
		if ((input === 'j' || key.downArrow) && milestones.length > 0) {
			setMilestoneIndex(i => Math.min(i + 1, milestones.length - 1));
			return;
		}
		if ((input === 'k' || key.upArrow) && milestones.length > 0) {
			setMilestoneIndex(i => Math.max(i - 1, 0));
			return;
		}
		if (input === ' ' && milestones.length > 0) {
			const updated = milestones.map((m, i) =>
				i === milestoneIndex ? {...m, completed: !m.completed} : m,
			);
			updateSprint(sprint.id, {milestones: updated});
		}
	});

	if (!config || !sprint) {
		return (
			<Box padding={1}>
				<Text color="red">Sprint not found</Text>
				<Text dimColor> · Press Esc to go back</Text>
			</Box>
		);
	}

	const progress = getSprintProgress(config, sprint.id);
	const tasks = config.tasks.filter(t => t.sprintId === sprint.id);

	const deadlineColor = (() => {
		if (!sprint.endDate) return undefined;
		if (sprint.status === 'completed') return undefined;
		const days = daysUntilDeadline(sprint.endDate);
		if (days <= 0) return 'red';
		if (days <= 3) return 'yellow';
		return undefined;
	})();

	const deadlineLabel = (() => {
		if (!sprint.endDate) return '(none)';
		const formatted = formatDeadlineShort(sprint.endDate);
		if (sprint.status === 'completed') return formatted;
		const days = daysUntilDeadline(sprint.endDate);
		if (days < 0) return `${formatted} (overdue)`;
		if (days === 0) return `${formatted} (today)`;
		if (days === 1) return `${formatted} (tomorrow)`;
		return `${formatted} (${days} days left)`;
	})();

	const tasksByStatus = new Map<TaskStatus, typeof tasks>();
	for (const task of tasks) {
		const list = tasksByStatus.get(task.status) ?? [];
		list.push(task);
		tasksByStatus.set(task.status, list);
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Box>
				<Text bold color="cyan">
					{sprint.name}
				</Text>
				<Text dimColor> · {shortId(sprint.id)}</Text>
				<Text dimColor>
					{' '}
					· {SPRINT_STATUS_LABELS[sprint.status]}
					{config.activeSprintId === sprint.id ? ' (active)' : ''}
				</Text>
			</Box>
			<Box>
				<Box width={12}>
					<Text dimColor>Start:</Text>
				</Box>
				<Text>{sprint.startDate ?? '(none)'}</Text>
			</Box>
			<Box>
				<Box width={12}>
					<Text dimColor>End:</Text>
				</Box>
				<Text color={deadlineColor}>{deadlineLabel}</Text>
			</Box>
			{sprint.description && (
				<Box marginTop={1} flexDirection="column">
					<Text dimColor>Description:</Text>
					<Text>{sprint.description}</Text>
				</Box>
			)}
			<Box marginTop={1} flexDirection="column">
				<Text dimColor>Completion:</Text>
				<Text>
					{renderProgressBar(progress.donePct)} {progress.donePct}% (
					{progress.byStatus.done}/{progress.total})
				</Text>
				<Text dimColor>
					Todo {progress.byStatus.todo} · In Progress{' '}
					{progress.byStatus.in_progress} · Review {progress.byStatus.review} ·
					Done {progress.byStatus.done}
				</Text>
			</Box>
			<Box marginTop={1} flexDirection="column">
				<Text dimColor>
					Milestones ({progress.milestoneDone}/{progress.milestoneTotal}):
				</Text>
				{(sprint.milestones ?? []).length === 0 ? (
					<Text dimColor> (none)</Text>
				) : (
					sprint.milestones.map((m, i) => (
						<Box key={m.id}>
							<Text color={i === milestoneIndex ? 'cyan' : undefined}>
								{i === milestoneIndex ? '› ' : '  '}
								{m.completed ? '☑' : '☐'} {m.text}
							</Text>
						</Box>
					))
				)}
			</Box>
			<Box marginTop={1} flexDirection="column">
				<Text dimColor>Tasks ({tasks.length}):</Text>
				{tasks.length === 0 ? (
					<Text dimColor> (none)</Text>
				) : (
					tasks.map(t => (
						<Box key={t.id} gap={1}>
							<Text dimColor>{shortId(t.id)}</Text>
							<Text color="cyan">[{TASK_STATUS_LABELS[t.status]}]</Text>
							<Text>{t.name}</Text>
						</Box>
					))
				)}
			</Box>
			<Box marginTop={1}>
				<Text dimColor>
					<Text color="yellow">e</Text>:edit · <Text color="yellow">j/k</Text>
					:select milestone · <Text color="yellow">space</Text>:toggle ·{' '}
					<Text color="yellow">Esc</Text>:back
				</Text>
			</Box>
		</Box>
	);
}
