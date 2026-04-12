import {Text, Box} from 'ink';
import React from 'react';
import {readConfig} from '../../utils/config.js';
import {listDocs, buildDocTree, flattenDocTree} from '../../utils/docs.js';

interface DocListOptions {
	flat?: boolean;
	json?: boolean;
}

export function docListCommand(options: DocListOptions): React.ReactNode {
	const config = readConfig();
	if (!config) {
		return React.createElement(
			Text,
			{color: 'red'},
			'No kanboard project found. Run "kanboard init" first.',
		);
	}

	const docs = listDocs(config);

	if (options.json) {
		return React.createElement(Text, null, JSON.stringify(docs, null, 2));
	}

	if (docs.length === 0) {
		return React.createElement(Text, {dimColor: true}, 'No docs found.');
	}

	if (options.flat) {
		return React.createElement(
			Box,
			{flexDirection: 'column'},
			...docs.map(doc =>
				React.createElement(
					Box,
					{key: doc.id, gap: 1},
					React.createElement(Text, null, doc.path),
					React.createElement(Text, {dimColor: true}, `(${doc.title})`),
				),
			),
		);
	}

	// Tree view
	const tree = buildDocTree(docs);
	const flattened = flattenDocTree(tree);

	return React.createElement(
		Box,
		{flexDirection: 'column'},
		...flattened.map(({node, depth}) => {
			const indent = '  '.repeat(depth);
			const prefix = node.isDirectory ? '\u{1F4C1} ' : '\u{1F4C4} ';
			return React.createElement(
				Text,
				{key: node.id},
				`${indent}${prefix}${node.title}`,
			);
		}),
	);
}
