import React from 'react';
import {Box, Text, useInput} from 'ink';
import {useKanboard} from '../../context/KanboardContext.js';
import {useNavigation} from '../../context/NavigationContext.js';

const BOARD_HELP = [
	{keys: 'h / \u2190', desc: 'Move to left column'},
	{keys: 'l / \u2192', desc: 'Move to right column'},
	{keys: 'j / \u2193', desc: 'Move down in column'},
	{keys: 'k / \u2191', desc: 'Move up in column'},
	{keys: 'Enter', desc: 'Open task details'},
	{keys: 'n', desc: 'Create new task'},
	{keys: 'e', desc: 'Edit selected task'},
	{keys: 'm + h/l', desc: 'Move task left/right'},
	{keys: 'd', desc: 'Delete selected task'},
	{keys: 'Tab', desc: 'Switch to Docs view'},
	{keys: '?', desc: 'Toggle help'},
	{keys: 'q', desc: 'Quit'},
];

const DOCS_HELP = [
	{keys: 'j / \u2193', desc: 'Move down'},
	{keys: 'k / \u2191', desc: 'Move up'},
	{keys: 'Enter', desc: 'Open doc / Expand folder'},
	{keys: 'h', desc: 'Collapse folder'},
	{keys: 'n', desc: 'Create new doc'},
	{keys: 'e', desc: 'Edit selected doc'},
	{keys: 'd', desc: 'Delete selected doc'},
	{keys: 'Tab', desc: 'Switch to Board view'},
	{keys: '?', desc: 'Toggle help'},
	{keys: 'q', desc: 'Quit'},
];

export function HelpOverlay() {
	const {currentView} = useKanboard();
	const {activeModal, setActiveModal} = useNavigation();

	useInput((input, key) => {
		if (activeModal !== 'help') return;

		if (input === '?' || key.escape) {
			setActiveModal('none');
		}
	});

	if (activeModal !== 'help') {
		return null;
	}

	const helpItems = currentView === 'board' ? BOARD_HELP : DOCS_HELP;

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			padding={1}
			marginY={1}
		>
			<Text bold color="cyan">
				Keyboard Shortcuts
			</Text>
			<Text dimColor>
				({currentView === 'board' ? 'Board View' : 'Docs View'})
			</Text>
			<Box flexDirection="column" marginTop={1}>
				{helpItems.map(item => (
					<Box key={item.keys}>
						<Box width={15}>
							<Text color="yellow">{item.keys}</Text>
						</Box>
						<Text>{item.desc}</Text>
					</Box>
				))}
			</Box>
			<Box marginTop={1}>
				<Text dimColor>Press ? or Esc to close</Text>
			</Box>
		</Box>
	);
}
