import {Text, Box} from 'ink';
import React from 'react';
import {deleteDoc, getDoc} from '../../utils/docs.js';

interface DocDeleteOptions {
	path?: string;
	force?: boolean;
}

export function docDeleteCommand(options: DocDeleteOptions): React.ReactNode {
	if (!options.path) {
		return React.createElement(Text, {color: 'red'}, 'Doc path is required.');
	}

	const existingDoc = getDoc(options.path);
	if (!existingDoc) {
		return React.createElement(
			Text,
			{color: 'red'},
			`Doc not found: ${options.path}`,
		);
	}

	if (!options.force) {
		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(
				Text,
				{color: 'yellow'},
				`Are you sure you want to delete "${existingDoc.title}"?`,
			),
			React.createElement(
				Text,
				{dimColor: true},
				'Use --force or -f to confirm deletion.',
			),
		);
	}

	try {
		const doc = deleteDoc(options.path);

		return React.createElement(
			Box,
			{flexDirection: 'column'},
			React.createElement(Text, {color: 'green'}, `Doc deleted: ${doc.title}`),
			React.createElement(Text, {dimColor: true}, `Path: ${doc.path}`),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return React.createElement(Text, {color: 'red'}, message);
	}
}
