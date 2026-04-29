import {Text, Box} from 'ink';
import React from 'react';
import {readConfig} from '../../utils/config.js';
import {getSprintProgress, renderProgressBar} from '../../utils/sprints.js';
import {SPRINT_STATUS_LABELS, TASK_STATUS_LABELS} from '../../types/index.js';
import {shortId} from '../../utils/id.js';

interface SprintShowOptions {
	id?: string;
}

export function sprintShowCommand(options: SprintShowOptions): React.ReactNode {
	if (!options.id) {
		return React.createElement(Text, {color: 'red'}, 'Sprint ID is required.');
	}
	const config = readConfig();
	if (!config) {
		return React.createElement(
			Text,
			{color: 'red'},
			'No kanboard project found. Run "kanboard init" first.',
		);
	}

	const sprint = config.sprints.find(
		s => s.id === options.id || s.id.startsWith(options.id!),
	);
	if (!sprint) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Sprint not found: ${options.id}`,
		);
	}

	const progress = getSprintProgress(config, sprint.id);
	const tasks = config.tasks.filter(t => t.sprintId === sprint.id);

	const milestoneSummary = `${progress.milestoneDone}/${progress.milestoneTotal}`;
	const dateRange =
		sprint.startDate && sprint.endDate
			? `${sprint.startDate} → ${sprint.endDate}`
			: sprint.endDate ?? 'no dates';

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(Text, {bold: true, color: 'cyan'}, sprint.name),
		React.createElement(
			Text,
			{dimColor: true},
			`ID: ${shortId(sprint.id)}  Status: ${
				SPRINT_STATUS_LABELS[sprint.status]
			}  Dates: ${dateRange}`,
		),
		sprint.description && React.createElement(Text, null, sprint.description),
		React.createElement(
			Text,
			null,
			`Progress: ${renderProgressBar(progress.donePct)} ${progress.donePct}% (${
				progress.byStatus.done
			}/${progress.total})`,
		),
		React.createElement(
			Text,
			{dimColor: true},
			`Todo ${progress.byStatus.todo} · In Progress ${progress.byStatus.in_progress} · Review ${progress.byStatus.review} · Done ${progress.byStatus.done}`,
		),
		sprint.milestones.length > 0 &&
			React.createElement(
				Box,
				{flexDirection: 'column', marginTop: 1},
				React.createElement(
					Text,
					{dimColor: true},
					`Milestones (${milestoneSummary}):`,
				),
				...sprint.milestones.map((m, i) =>
					React.createElement(
						Text,
						{key: i},
						`  ${m.completed ? '☑' : '☐'} ${m.text}`,
					),
				),
			),
		tasks.length > 0 &&
			React.createElement(
				Box,
				{flexDirection: 'column', marginTop: 1},
				React.createElement(Text, {dimColor: true}, 'Tasks:'),
				...tasks.map(t =>
					React.createElement(
						Box,
						{key: t.id, gap: 1},
						React.createElement(Text, {dimColor: true}, shortId(t.id)),
						React.createElement(
							Text,
							{color: 'cyan'},
							`[${TASK_STATUS_LABELS[t.status]}]`,
						),
						React.createElement(Text, null, t.name),
					),
				),
			),
	);
}
