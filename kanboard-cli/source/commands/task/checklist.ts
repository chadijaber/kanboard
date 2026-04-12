import {Text, Box} from 'ink';
import React from 'react';
import {readConfig, writeConfig} from '../../utils/config.js';
import {generateId} from '../../utils/id.js';
import {shortId} from '../../utils/id.js';

function getTaskFromConfig(id?: string) {
	if (!id) return {error: 'Task ID is required.'};
	const config = readConfig();
	if (!config) return {error: 'No kanboard project found. Run "kanboard-cli init" first.'};
	const task = config.tasks.find(t => t.id === id || t.id.startsWith(id));
	if (!task) return {error: `Task not found: ${id}`};
	return {config, task};
}

interface ChecklistAddOptions {
	id?: string;
	text?: string;
}

export function taskChecklistAddCommand(options: ChecklistAddOptions): React.ReactNode {
	if (!options.text) {
		return React.createElement(Text, {color: 'red'}, 'Item text is required. Use --text or -T');
	}

	const result = getTaskFromConfig(options.id);
	if ('error' in result) {
		return React.createElement(Text, {color: 'red'}, result.error);
	}

	const {config, task} = result;
	const newItem = {id: generateId(), text: options.text.trim(), completed: false};
	task.checklist = [...(task.checklist ?? []), newItem];
	task.updatedAt = new Date().toISOString();
	writeConfig(config);

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(Text, {color: 'green'}, `Checklist item added to: ${task.name}`),
		React.createElement(Text, {dimColor: true}, `Item: ${newItem.text}`),
		React.createElement(Text, {dimColor: true}, `Task ID: ${shortId(task.id)}`),
	);
}

interface ChecklistToggleOptions {
	id?: string;
	index?: number;
}

export function taskChecklistToggleCommand(options: ChecklistToggleOptions): React.ReactNode {
	if (options.index === undefined || isNaN(options.index)) {
		return React.createElement(Text, {color: 'red'}, 'Item index is required. Use --index');
	}

	const result = getTaskFromConfig(options.id);
	if ('error' in result) {
		return React.createElement(Text, {color: 'red'}, result.error);
	}

	const {config, task} = result;
	const checklist = task.checklist ?? [];
	if (options.index < 0 || options.index >= checklist.length) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Index out of range. Task has ${checklist.length} checklist item(s) (0-based).`,
		);
	}

	const item = checklist[options.index]!;
	item.completed = !item.completed;
	task.updatedAt = new Date().toISOString();
	writeConfig(config);

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(
			Text,
			{color: 'green'},
			`Checklist item ${item.completed ? 'checked' : 'unchecked'}: ${item.text}`,
		),
		React.createElement(Text, {dimColor: true}, `Task ID: ${shortId(task.id)}`),
	);
}

interface ChecklistRemoveOptions {
	id?: string;
	index?: number;
}

export function taskChecklistRemoveCommand(options: ChecklistRemoveOptions): React.ReactNode {
	if (options.index === undefined || isNaN(options.index)) {
		return React.createElement(Text, {color: 'red'}, 'Item index is required. Use --index');
	}

	const result = getTaskFromConfig(options.id);
	if ('error' in result) {
		return React.createElement(Text, {color: 'red'}, result.error);
	}

	const {config, task} = result;
	const checklist = task.checklist ?? [];
	if (options.index < 0 || options.index >= checklist.length) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Index out of range. Task has ${checklist.length} checklist item(s) (0-based).`,
		);
	}

	const removed = checklist[options.index]!;
	task.checklist = checklist.filter((_, i) => i !== options.index);
	task.updatedAt = new Date().toISOString();
	writeConfig(config);

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(Text, {color: 'green'}, `Checklist item removed: ${removed.text}`),
		React.createElement(Text, {dimColor: true}, `Task ID: ${shortId(task.id)}`),
	);
}
