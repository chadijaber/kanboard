import {Text, Box} from 'ink';
import React from 'react';
import {getDoc} from '../../utils/docs.js';

interface DocReadOptions {
	path?: string;
}

export function docReadCommand(options: DocReadOptions): React.ReactNode {
	if (!options.path) {
		return React.createElement(Text, {color: 'red'}, 'Doc path is required.');
	}

	const doc = getDoc(options.path);
	if (!doc) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Doc not found: ${options.path}`,
		);
	}

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		React.createElement(Text, {bold: true}, doc.title),
		React.createElement(Text, {dimColor: true}, `Path: ${doc.path}`),
		React.createElement(Text, null, ''),
		React.createElement(Text, null, doc.content || '(empty)'),
		React.createElement(Text, null, ''),
		React.createElement(Text, {dimColor: true}, `Created: ${doc.createdAt}`),
		React.createElement(Text, {dimColor: true}, `Updated: ${doc.updatedAt}`),
	);
}
