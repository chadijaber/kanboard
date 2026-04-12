import React from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';

export function DocViewView() {
	const {config, selectedDocPath} = useKanboard();
	const {setActiveModal, setEditingDocPath} = useNavigation();

	const doc = config?.docs.find(d => d.path === selectedDocPath);

	useInput((input, key) => {
		if (key.escape) {
			setActiveModal('none');
		}

		if (input === 'e' && doc) {
			setEditingDocPath(doc.path);
			setActiveModal('doc-form');
		}
	});

	if (!doc) {
		return (
			<Box borderStyle="round" borderColor="red" padding={1}>
				<Text color="red">Doc not found</Text>
			</Box>
		);
	}

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			padding={1}
			marginY={1}
		>
			<Text bold color="cyan">
				{doc.title}
			</Text>
			<Text dimColor>Path: {doc.path}</Text>
			<Box marginTop={1} flexDirection="column">
				<Text>{doc.content || '(empty)'}</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>Created: {doc.createdAt}</Text>
			</Box>
			<Box>
				<Text dimColor>Updated: {doc.updatedAt}</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>Press </Text>
				<Text color="yellow">e</Text>
				<Text dimColor> to edit, </Text>
				<Text color="yellow">Esc</Text>
				<Text dimColor> to close</Text>
			</Box>
		</Box>
	);
}
