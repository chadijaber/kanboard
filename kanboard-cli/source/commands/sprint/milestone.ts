import {Text, Box} from 'ink';
import React from 'react';
import {readConfig, writeConfig} from '../../utils/config.js';
import {generateId, shortId} from '../../utils/id.js';

function getSprintFromConfig(id?: string) {
	if (!id) return {error: 'Sprint ID is required.'};
	const config = readConfig();
	if (!config)
		return {error: 'No kanboard project found. Run "kanboard-cli init" first.'};
	const sprint = config.sprints.find(s => s.id === id || s.id.startsWith(id));
	if (!sprint) return {error: `Sprint not found: ${id}`};
	return {config, sprint};
}

interface MilestoneAddOptions {
	id?: string;
	text?: string;
}

export function sprintMilestoneAddCommand(
	options: MilestoneAddOptions,
): React.ReactNode {
	if (!options.text) {
		return React.createElement(
			Text,
			{color: 'red'},
			'Milestone text is required. Use --text or -T',
		);
	}
	const result = getSprintFromConfig(options.id);
	if ('error' in result) {
		return React.createElement(Text, {color: 'red'}, result.error);
	}
	const {config, sprint} = result;
	const item = {
		id: generateId(),
		text: options.text.trim(),
		completed: false,
	};
	sprint.milestones = [...(sprint.milestones ?? []), item];
	sprint.updatedAt = new Date().toISOString();
	writeConfig(config);

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(
			Text,
			{color: 'green'},
			`Milestone added to: ${sprint.name}`,
		),
		React.createElement(Text, {dimColor: true}, `Item: ${item.text}`),
		React.createElement(
			Text,
			{dimColor: true},
			`Sprint ID: ${shortId(sprint.id)}`,
		),
	);
}

interface MilestoneToggleOptions {
	id?: string;
	index?: number;
}

export function sprintMilestoneToggleCommand(
	options: MilestoneToggleOptions,
): React.ReactNode {
	if (options.index === undefined || isNaN(options.index)) {
		return React.createElement(
			Text,
			{color: 'red'},
			'Milestone index is required. Use --index',
		);
	}
	const result = getSprintFromConfig(options.id);
	if ('error' in result) {
		return React.createElement(Text, {color: 'red'}, result.error);
	}
	const {config, sprint} = result;
	const milestones = sprint.milestones ?? [];
	if (options.index < 0 || options.index >= milestones.length) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Index out of range. Sprint has ${milestones.length} milestone(s) (0-based).`,
		);
	}
	const item = milestones[options.index]!;
	item.completed = !item.completed;
	sprint.updatedAt = new Date().toISOString();
	writeConfig(config);

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(
			Text,
			{color: 'green'},
			`Milestone ${item.completed ? 'checked' : 'unchecked'}: ${item.text}`,
		),
		React.createElement(
			Text,
			{dimColor: true},
			`Sprint ID: ${shortId(sprint.id)}`,
		),
	);
}

interface MilestoneRemoveOptions {
	id?: string;
	index?: number;
}

export function sprintMilestoneRemoveCommand(
	options: MilestoneRemoveOptions,
): React.ReactNode {
	if (options.index === undefined || isNaN(options.index)) {
		return React.createElement(
			Text,
			{color: 'red'},
			'Milestone index is required. Use --index',
		);
	}
	const result = getSprintFromConfig(options.id);
	if ('error' in result) {
		return React.createElement(Text, {color: 'red'}, result.error);
	}
	const {config, sprint} = result;
	const milestones = sprint.milestones ?? [];
	if (options.index < 0 || options.index >= milestones.length) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Index out of range. Sprint has ${milestones.length} milestone(s) (0-based).`,
		);
	}
	const removed = milestones[options.index]!;
	sprint.milestones = milestones.filter((_, i) => i !== options.index);
	sprint.updatedAt = new Date().toISOString();
	writeConfig(config);

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(
			Text,
			{color: 'green'},
			`Milestone removed: ${removed.text}`,
		),
		React.createElement(
			Text,
			{dimColor: true},
			`Sprint ID: ${shortId(sprint.id)}`,
		),
	);
}
