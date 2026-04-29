import React, {useMemo} from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {SPRINT_STATUS_LABELS} from '../../types/index.js';
import {
	listSprints,
	getSprintProgress,
	renderProgressBar,
} from '../../utils/sprints.js';

export function SprintsView() {
	const {
		config,
		deleteSprint,
		setActiveSprint,
		setCurrentView,
		setSelectedSprintId,
	} = useKanboard();
	const {
		setActiveModal,
		setEditingSprintId,
		selectedSprintIndex,
		setSelectedSprintIndex,
		setConfirmAction,
		setConfirmMessage,
	} = useNavigation();

	const sprints = useMemo(() => (config ? listSprints(config) : []), [config]);

	const selectedSprint = sprints[selectedSprintIndex];

	useInput((input, key) => {
		if (!config) return;

		if (input === 'j' || key.downArrow) {
			setSelectedSprintIndex(
				Math.min(sprints.length - 1, selectedSprintIndex + 1),
			);
			return;
		}
		if (input === 'k' || key.upArrow) {
			setSelectedSprintIndex(Math.max(0, selectedSprintIndex - 1));
			return;
		}
		if (input === 'n') {
			setEditingSprintId(null);
			setActiveModal('sprint-form');
			return;
		}
		if (input === 'e' && selectedSprint) {
			setEditingSprintId(selectedSprint.id);
			setActiveModal('sprint-form');
			return;
		}
		if (input === 'a' && selectedSprint) {
			setActiveSprint(selectedSprint.id);
			return;
		}
		if (key.return && selectedSprint) {
			setSelectedSprintId(selectedSprint.id);
			setCurrentView('sprint-detail');
			return;
		}
		if (input === 'd' && selectedSprint) {
			const sprint = selectedSprint;
			const taskCount = config.tasks.filter(
				t => t.sprintId === sprint.id,
			).length;
			const suffix =
				taskCount > 0
					? ` (${taskCount} task${taskCount === 1 ? '' : 's'} → backlog)`
					: '';
			setConfirmMessage(`Delete sprint "${sprint.name}"?${suffix}`);
			setConfirmAction(() => () => {
				deleteSprint(sprint.id);
				setSelectedSprintIndex(Math.max(0, selectedSprintIndex - 1));
			});
			setActiveModal('confirm-delete');
		}
	});

	if (!config) return null;

	if (sprints.length === 0) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text dimColor>No sprints yet.</Text>
				<Text dimColor>
					Press <Text color="yellow">n</Text> to create one.
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			{sprints.map((sprint, idx) => {
				const isSelected = idx === selectedSprintIndex;
				const isActive = config.activeSprintId === sprint.id;
				const progress = getSprintProgress(config, sprint.id);
				const dateRange =
					sprint.startDate && sprint.endDate
						? `${sprint.startDate} → ${sprint.endDate}`
						: sprint.endDate ?? 'no dates';
				return (
					<Box
						key={sprint.id}
						borderStyle={isSelected ? 'round' : undefined}
						borderColor={isSelected ? 'cyan' : isActive ? 'green' : undefined}
						paddingX={1}
					>
						<Box width={14}>
							<Text color={isActive ? 'green' : 'cyan'}>
								[{SPRINT_STATUS_LABELS[sprint.status]}
								{isActive ? ' *' : ''}]
							</Text>
						</Box>
						<Box flexGrow={1}>
							<Text bold>{sprint.name}</Text>
						</Box>
						<Box width={28}>
							<Text dimColor>{dateRange}</Text>
						</Box>
						<Box width={22}>
							<Text dimColor>
								{renderProgressBar(progress.donePct, 10)} {progress.donePct}% (
								{progress.byStatus.done}/{progress.total})
							</Text>
						</Box>
					</Box>
				);
			})}
		</Box>
	);
}
