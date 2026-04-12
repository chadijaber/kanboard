import {Text, Box} from 'ink';
import React from 'react';
import {createDoc} from '../../utils/docs.js';

interface DocAddOptions {
	path?: string;
	title?: string;
	content?: string;
}

export function docAddCommand(options: DocAddOptions): React.ReactNode {
	if (!options.path) {
		return React.createElement(
			Text,
			{color: 'red'},
			'Doc path is required. Use --path or -p',
		);
	}

	if (!options.title) {
		return React.createElement(
			Text,
			{color: 'red'},
			'Doc title is required. Use --title or -t',
		);
	}

	try {
		const doc = createDoc({
			path: options.path,
			title: options.title,
			content: options.content,
		});

		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(Text, {color: 'green'}, `Doc created: ${doc.title}`),
			React.createElement(Text, {dimColor: true}, `Path: ${doc.path}`),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return React.createElement(Text, {color: 'red'}, message);
	}
}
