import React, {useMemo, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';
import {SPRINT_STATUS_LABELS} from '../../types/index.js';
import {listSprints} from '../../utils/sprints.js';

export function SprintSwitcherView() {
	const {config, setActiveSprint} = useKanboard();
	const {setActiveModal} = useNavigation();

	const sprints = useMemo(() => (config ? listSprints(config) : []), [config]);

	const [index, setIndex] = useState(() => {
		if (!config) return 0;
		const i = sprints.findIndex(s => s.id === config.activeSprintId);
		return i >= 0 ? i : 0;
	});

	useInput((input, key) => {
		if (key.escape) {
			setActiveModal('none');
			return;
		}
		if ((input === 'j' || key.downArrow) && sprints.length > 0) {
			setIndex(i => Math.min(i + 1, sprints.length - 1));
			return;
		}
		if ((input === 'k' || key.upArrow) && sprints.length > 0) {
			setIndex(i => Math.max(0, i - 1));
			return;
		}
		if (key.return && sprints.length > 0) {
			const sprint = sprints[index];
			if (sprint) {
				setActiveSprint(sprint.id);
			}
			setActiveModal('none');
		}
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			padding={1}
			marginY={1}
		>
			<Text bold color="cyan">
				Switch Sprint
			</Text>
			{sprints.length === 0 ? (
				<Box marginTop={1}>
					<Text dimColor>
						No sprints yet. Create one with `kanboard sprint add` or from the
						Sprints view.
					</Text>
				</Box>
			) : (
				<Box marginTop={1} flexDirection="column">
					{sprints.map((sprint, i) => {
						const isActive = config?.activeSprintId === sprint.id;
						return (
							<Box key={sprint.id}>
								<Text color={i === index ? 'cyan' : undefined}>
									{i === index ? '› ' : '  '}
									{isActive ? '★ ' : '  '}
								</Text>
								<Box width={14}>
									<Text dimColor>[{SPRINT_STATUS_LABELS[sprint.status]}]</Text>
								</Box>
								<Text>{sprint.name}</Text>
							</Box>
						);
					})}
				</Box>
			)}
			<Box marginTop={1}>
				<Text dimColor>j/k:select · Enter:switch · Esc:cancel</Text>
			</Box>
		</Box>
	);
}
