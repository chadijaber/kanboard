import React from 'react';
import {Box, Text} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';

export function Header() {
	const {config, currentView} = useKanboard();

	if (!config) {
		return null;
	}

	const viewLabel = currentView === 'board' ? 'Board' : 'Docs';

	return (
		<Box borderStyle="single" borderColor="cyan" paddingX={1} marginBottom={1}>
			<Box flexGrow={1}>
				<Text bold color="cyan">
					{config.project.name}
				</Text>
				{config.project.githubUrl && (
					<Text dimColor> - {config.project.githubUrl}</Text>
				)}
			</Box>
			<Text color="yellow">[{viewLabel}]</Text>
		</Box>
	);
}
