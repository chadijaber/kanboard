import {Text, Box} from 'ink';
import React from 'react';
import {readConfig} from '../../utils/config.js';
import {
	listSprints,
	getSprintProgress,
	renderProgressBar,
} from '../../utils/sprints.js';
import {SPRINT_STATUS_LABELS} from '../../types/index.js';
import {shortId} from '../../utils/id.js';

interface SprintListOptions {
	json?: boolean;
}

export function sprintListCommand(options: SprintListOptions): React.ReactNode {
	const config = readConfig();
	if (!config) {
		return React.createElement(
			Text,
			{color: 'red'},
			'No kanboard project found. Run "kanboard init" first.',
		);
	}

	const sprints = listSprints(config);

	if (options.json) {
		return React.createElement(Text, null, JSON.stringify(sprints, null, 2));
	}

	if (sprints.length === 0) {
		return React.createElement(Text, {dimColor: true}, 'No sprints found.');
	}

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		...sprints.map(sprint => {
			const progress = getSprintProgress(config, sprint.id);
			const isActive = config.activeSprintId === sprint.id;
			const dateRange =
				sprint.startDate && sprint.endDate
					? `${sprint.startDate} → ${sprint.endDate}`
					: sprint.endDate ?? 'no dates';
			return React.createElement(
				Box,
				{key: sprint.id, gap: 1},
				React.createElement(Text, {dimColor: true}, shortId(sprint.id)),
				React.createElement(
					Text,
					{color: isActive ? 'green' : 'cyan'},
					`[${SPRINT_STATUS_LABELS[sprint.status]}${isActive ? ' *' : ''}]`,
				),
				React.createElement(Text, null, sprint.name),
				React.createElement(Text, {dimColor: true}, dateRange),
				React.createElement(
					Text,
					{dimColor: true},
					`${renderProgressBar(progress.donePct, 10)} ${progress.donePct}% (${
						progress.byStatus.done
					}/${progress.total})`,
				),
			);
		}),
	);
}
