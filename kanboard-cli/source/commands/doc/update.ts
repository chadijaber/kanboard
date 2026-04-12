import {Text, Box} from 'ink';
import React from 'react';
import {updateDoc} from '../../utils/docs.js';

interface DocUpdateOptions {
	path?: string;
	title?: string;
	content?: string;
}

export function docUpdateCommand(options: DocUpdateOptions): React.ReactNode {
	if (!options.path) {
		return React.createElement(Text, {color: 'red'}, 'Doc path is required.');
	}

	const hasUpdates =
		options.title !== undefined || options.content !== undefined;

	if (!hasUpdates) {
		return React.createElement(
			Text,
			{color: 'yellow'},
			'No updates provided. Use --title or --content',
		);
	}

	try {
		const doc = updateDoc(options.path, {
			title: options.title,
			content: options.content,
		});

		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(Text, {color: 'green'}, `Doc updated: ${doc.title}`),
			React.createElement(Text, {dimColor: true}, `Path: ${doc.path}`),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return React.createElement(Text, {color: 'red'}, message);
	}
}
